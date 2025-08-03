const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken,
  createSession, 
  updateLastLogin,
  invalidateSession,
  authenticateToken 
} = require('../middleware/auth');
const { AppError, catchAsync, createValidationError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    throw createValidationError('Validation failed', errorMessages);
  }
};

// Register endpoint
router.post('/register', registerValidation, catchAsync(async (req, res) => {
  checkValidation(req);

  const { email, password, firstName, lastName, username, avatar, bio } = req.body;
  const db = database.getDb();

  // Check if user already exists
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409, 'EMAIL_EXISTS');
  }

  // Check if username is taken (if provided)
  if (username) {
    const existingUsername = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername) {
      throw new AppError('Username is already taken', 409, 'USERNAME_EXISTS');
    }
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate unique username if not provided
  let finalUsername = username;
  if (!finalUsername) {
    finalUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.random().toString(36).substr(2, 6)}`;
  }

  // Create user
  const result = await db.run(`
    INSERT INTO users (email, password, firstName, lastName, username, avatar, bio, emailVerified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [email, hashedPassword, firstName, lastName, finalUsername, avatar || null, bio || null, 0]);

  const userId = result.lastID;

  // Generate tokens
  const tokenPayload = { userId, email, isAdmin: false };
  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Create session
  const sessionId = await createSession(
    userId, 
    token, 
    refreshToken,
    req.get('User-Agent'),
    req.ip
  );

  // Update last login
  await updateLastLogin(userId);

  // Get user data (without password)
  const user = await db.get(`
    SELECT id, email, firstName, lastName, username, avatar, bio, isAdmin, createdAt
    FROM users WHERE id = ?
  `, [userId]);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
      refreshToken,
      sessionId
    }
  });
}));

// Login endpoint
router.post('/login', loginValidation, catchAsync(async (req, res) => {
  checkValidation(req);

  const { email, password, rememberMe } = req.body;
  const db = database.getDb();

  // Find user
  const user = await db.get(`
    SELECT id, email, password, firstName, lastName, username, avatar, bio, isAdmin, isActive
    FROM users WHERE email = ?
  `, [email]);

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokenPayload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Create session
  const sessionId = await createSession(
    user.id, 
    token, 
    refreshToken,
    req.get('User-Agent'),
    req.ip
  );

  // Update last login
  await updateLastLogin(user.id);

  // Remove password from response
  delete user.password;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
      refreshToken,
      sessionId
    }
  });
}));

// Refresh token endpoint
router.post('/refresh', catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const db = database.getDb();

  // Check if session exists
  const session = await db.get(
    'SELECT * FROM user_sessions WHERE refreshToken = ? AND isActive = 1',
    [refreshToken]
  );

  if (!session) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Get user
  const user = await db.get(`
    SELECT id, email, firstName, lastName, username, avatar, bio, isAdmin, isActive
    FROM users WHERE id = ? AND isActive = 1
  `, [decoded.userId]);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Generate new tokens
  const tokenPayload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
  const newToken = generateToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Update session
  await db.run(`
    UPDATE user_sessions 
    SET token = ?, refreshToken = ?, expiresAt = datetime("now", "+7 days")
    WHERE id = ?
  `, [newToken, newRefreshToken, session.id]);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      user,
      token: newToken,
      refreshToken: newRefreshToken
    }
  });
}));

// Logout endpoint
router.post('/logout', authenticateToken, catchAsync(async (req, res) => {
  // Invalidate current session
  await invalidateSession(req.sessionId);

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Logout all devices
router.post('/logout-all', authenticateToken, catchAsync(async (req, res) => {
  const db = database.getDb();

  // Invalidate all user sessions
  await db.run(
    'UPDATE user_sessions SET isActive = 0 WHERE userId = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
}));

// Get current user
router.get('/me', authenticateToken, catchAsync(async (req, res) => {
  const db = database.getDb();

  const user = await db.get(`
    SELECT 
      id, email, firstName, lastName, username, avatar, bio, location, website,
      company, position, github, linkedin, twitter, skills, isAdmin, emailVerified,
      lastLoginAt, createdAt, updatedAt
    FROM users WHERE id = ?
  `, [req.user.id]);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Parse JSON fields
  user.skills = user.skills ? JSON.parse(user.skills) : [];

  res.json({
    success: true,
    data: { user }
  });
}));

// Update profile
router.patch('/profile', authenticateToken, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
], catchAsync(async (req, res) => {
  checkValidation(req);

  const db = database.getDb();
  const {
    firstName, lastName, bio, location, website, company, position,
    github, linkedin, twitter, skills
  } = req.body;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (firstName !== undefined) {
    updates.push('firstName = ?');
    values.push(firstName);
  }
  if (lastName !== undefined) {
    updates.push('lastName = ?');
    values.push(lastName);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    values.push(location);
  }
  if (website !== undefined) {
    updates.push('website = ?');
    values.push(website);
  }
  if (company !== undefined) {
    updates.push('company = ?');
    values.push(company);
  }
  if (position !== undefined) {
    updates.push('position = ?');
    values.push(position);
  }
  if (github !== undefined) {
    updates.push('github = ?');
    values.push(github);
  }
  if (linkedin !== undefined) {
    updates.push('linkedin = ?');
    values.push(linkedin);
  }
  if (twitter !== undefined) {
    updates.push('twitter = ?');
    values.push(twitter);
  }
  if (skills !== undefined) {
    updates.push('skills = ?');
    values.push(JSON.stringify(skills));
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400, 'NO_UPDATES');
  }

  updates.push('updatedAt = datetime("now")');
  values.push(req.user.id);

  await db.run(`
    UPDATE users SET ${updates.join(', ')} WHERE id = ?
  `, values);

  // Get updated user
  const user = await db.get(`
    SELECT 
      id, email, firstName, lastName, username, avatar, bio, location, website,
      company, position, github, linkedin, twitter, skills, isAdmin, emailVerified,
      lastLoginAt, createdAt, updatedAt
    FROM users WHERE id = ?
  `, [req.user.id]);

  user.skills = user.skills ? JSON.parse(user.skills) : [];

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// Change password
router.patch('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], catchAsync(async (req, res) => {
  checkValidation(req);

  const { currentPassword, newPassword } = req.body;
  const db = database.getDb();

  // Get user with password
  const user = await db.get(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id]
  );

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await db.run(
    'UPDATE users SET password = ?, updatedAt = datetime("now") WHERE id = ?',
    [hashedPassword, req.user.id]
  );

  // Invalidate all other sessions (keep current session)
  await db.run(
    'UPDATE user_sessions SET isActive = 0 WHERE userId = ? AND id != ?',
    [req.user.id, req.sessionId]
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

module.exports = router;
