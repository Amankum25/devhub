const express = require('express');
const database = require('../config/database');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { validationRules } = require('../middleware/validation');

const router = express.Router();

// Get all public snippets
router.get('/', optionalAuth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const language = req.query.language || '';
  const tag = req.query.tag || '';
  const sort = req.query.sort || 'recent';
  const offset = (page - 1) * limit;

  const db = database.getDb();

  // Build conditions
  let conditions = ['s.isPublic = 1'];
  let params = [];

  if (search) {
    conditions.push('(s.title LIKE ? OR s.description LIKE ? OR s.code LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (language) {
    conditions.push('s.language = ?');
    params.push(language);
  }

  if (tag) {
    conditions.push('s.tags LIKE ?');
    params.push(`%"${tag}"%`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Build sort clause
  let sortClause = '';
  switch (sort) {
    case 'popular':
      sortClause = 'ORDER BY s.likes DESC, s.views DESC';
      break;
    case 'views':
      sortClause = 'ORDER BY s.views DESC';
      break;
    case 'forks':
      sortClause = 'ORDER BY s.forks DESC';
      break;
    case 'recent':
    default:
      sortClause = 'ORDER BY s.createdAt DESC';
      break;
  }

  // Get snippets
  const snippets = await db.all(`
    SELECT 
      s.id, s.title, s.description, s.code, s.language, s.tags,
      s.views, s.likes, s.forks, s.createdAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM snippets s
    JOIN users u ON s.userId = u.id
    ${whereClause}
    ${sortClause}
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  // Parse JSON fields
  snippets.forEach(snippet => {
    snippet.tags = snippet.tags ? JSON.parse(snippet.tags) : [];
  });

  // Get total count
  const countResult = await db.get(`
    SELECT COUNT(*) as total 
    FROM snippets s
    JOIN users u ON s.userId = u.id
    ${whereClause}
  `, params);

  const total = countResult.total;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      snippets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// Get single snippet
router.get('/:snippetId', optionalAuth, validationRules.withSnippetId, catchAsync(async (req, res) => {
  const { snippetId } = req.params;
  const db = database.getDb();

  const snippet = await db.get(`
    SELECT 
      s.*,
      u.firstName, u.lastName, u.username, u.avatar, u.bio
    FROM snippets s
    JOIN users u ON s.userId = u.id
    WHERE s.id = ? AND (s.isPublic = 1 OR s.userId = ?)
  `, [snippetId, req.user?.id || 0]);

  if (!snippet) {
    throw new AppError('Snippet not found', 404, 'SNIPPET_NOT_FOUND');
  }

  // Parse JSON fields
  snippet.tags = snippet.tags ? JSON.parse(snippet.tags) : [];

  // Increment view count
  await db.run('UPDATE snippets SET views = views + 1 WHERE id = ?', [snippetId]);
  snippet.views += 1;

  res.json({
    success: true,
    data: { snippet }
  });
}));

// Create new snippet
router.post('/', authenticateToken, validationRules.createSnippet, catchAsync(async (req, res) => {
  const { title, description, code, language, tags, isPublic } = req.body;
  const db = database.getDb();

  // Create snippet
  const result = await db.run(`
    INSERT INTO snippets (userId, title, description, code, language, tags, isPublic)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    req.user.id,
    title,
    description || null,
    code,
    language,
    JSON.stringify(tags || []),
    isPublic !== undefined ? isPublic : true
  ]);

  // Get created snippet
  const snippet = await db.get(`
    SELECT 
      s.*,
      u.firstName, u.lastName, u.username, u.avatar
    FROM snippets s
    JOIN users u ON s.userId = u.id
    WHERE s.id = ?
  `, [result.lastID]);

  snippet.tags = snippet.tags ? JSON.parse(snippet.tags) : [];

  res.status(201).json({
    success: true,
    message: 'Snippet created successfully',
    data: { snippet }
  });
}));

// Update snippet
router.put('/:snippetId', authenticateToken, validationRules.updateSnippet, catchAsync(async (req, res) => {
  const { snippetId } = req.params;
  const { title, description, code, language, tags, isPublic } = req.body;
  const db = database.getDb();

  // Check if snippet exists and user owns it
  const existingSnippet = await db.get(
    'SELECT * FROM snippets WHERE id = ?',
    [snippetId]
  );

  if (!existingSnippet) {
    throw new AppError('Snippet not found', 404, 'SNIPPET_NOT_FOUND');
  }

  if (existingSnippet.userId !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Update snippet
  await db.run(`
    UPDATE snippets SET 
      title = ?, description = ?, code = ?, language = ?, tags = ?, 
      isPublic = ?, updatedAt = datetime('now')
    WHERE id = ?
  `, [
    title || existingSnippet.title,
    description !== undefined ? description : existingSnippet.description,
    code || existingSnippet.code,
    language || existingSnippet.language,
    JSON.stringify(tags || (existingSnippet.tags ? JSON.parse(existingSnippet.tags) : [])),
    isPublic !== undefined ? isPublic : existingSnippet.isPublic,
    snippetId
  ]);

  // Get updated snippet
  const snippet = await db.get(`
    SELECT 
      s.*,
      u.firstName, u.lastName, u.username, u.avatar
    FROM snippets s
    JOIN users u ON s.userId = u.id
    WHERE s.id = ?
  `, [snippetId]);

  snippet.tags = snippet.tags ? JSON.parse(snippet.tags) : [];

  res.json({
    success: true,
    message: 'Snippet updated successfully',
    data: { snippet }
  });
}));

// Delete snippet
router.delete('/:snippetId', authenticateToken, validationRules.withSnippetId, catchAsync(async (req, res) => {
  const { snippetId } = req.params;
  const db = database.getDb();

  // Check if snippet exists and user owns it
  const snippet = await db.get('SELECT userId FROM snippets WHERE id = ?', [snippetId]);
  
  if (!snippet) {
    throw new AppError('Snippet not found', 404, 'SNIPPET_NOT_FOUND');
  }

  if (snippet.userId !== req.user.id && !req.user.isAdmin) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Delete snippet
  await db.run('DELETE FROM snippets WHERE id = ?', [snippetId]);

  res.json({
    success: true,
    message: 'Snippet deleted successfully'
  });
}));

// Get popular languages
router.get('/languages/popular', catchAsync(async (req, res) => {
  const db = database.getDb();
  
  const languages = await db.all(`
    SELECT 
      language,
      COUNT(*) as count
    FROM snippets
    WHERE isPublic = 1
    GROUP BY language
    ORDER BY count DESC
    LIMIT 20
  `);

  res.json({
    success: true,
    data: { languages }
  });
}));

// Get user's snippets
router.get('/user/:userId', optionalAuth, catchAsync(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const db = database.getDb();

  // Check if user exists
  const user = await db.get('SELECT id FROM users WHERE id = ? AND isActive = 1', [userId]);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Get public snippets (or user's own snippets if viewing own profile)
  const isOwnProfile = req.user && req.user.id === parseInt(userId);
  const visibilityCondition = isOwnProfile ? '' : 'AND s.isPublic = 1';

  const snippets = await db.all(`
    SELECT 
      s.id, s.title, s.description, s.language, s.tags,
      s.views, s.likes, s.forks, s.isPublic, s.createdAt
    FROM snippets s
    WHERE s.userId = ? ${visibilityCondition}
    ORDER BY s.createdAt DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset]);

  // Parse JSON fields
  snippets.forEach(snippet => {
    snippet.tags = snippet.tags ? JSON.parse(snippet.tags) : [];
  });

  // Get total count
  const countResult = await db.get(`
    SELECT COUNT(*) as total 
    FROM snippets s
    WHERE s.userId = ? ${visibilityCondition}
  `, [userId]);

  const total = countResult.total;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      snippets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

module.exports = router;
