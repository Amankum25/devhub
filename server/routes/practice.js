const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

// Path to the merged problems data
const PROBLEMS_FILE = path.join(__dirname, '..', 'data', 'merged_problems.json');

// Helper function to read problems data
function getProblemsData() {
  try {
    if (fs.existsSync(PROBLEMS_FILE)) {
      const data = fs.readFileSync(PROBLEMS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading problems data:', error);
    return [];
  }
}

// GET /api/practice - Get all problems with filtering
router.get('/', (req, res) => {
  try {
    let problems = getProblemsData();
    
    const { difficulty, company, topic, search, page = 1, limit = 50 } = req.query;
    
    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      problems = problems.filter(p => 
        p.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    // Filter by company
    if (company && company !== 'all') {
      problems = problems.filter(p => 
        p.company.some(c => c.toLowerCase().includes(company.toLowerCase()))
      );
    }
    
    // Filter by topic
    if (topic && topic !== 'all') {
      problems = problems.filter(p => 
        p.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
      );
    }
    
    // Search by title
    if (search) {
      const searchLower = search.toLowerCase();
      problems = problems.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProblems = problems.slice(startIndex, endIndex);
    
    res.json({
      problems: paginatedProblems,
      total: problems.length,
      page: parseInt(page),
      totalPages: Math.ceil(problems.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/practice/stats - Get statistics
router.get('/stats', (req, res) => {
  try {
    const problems = getProblemsData();
    
    // Count by difficulty
    const byDifficulty = problems.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    // Get all unique companies
    const companies = [...new Set(problems.flatMap(p => p.company))].sort();
    
    // Get all unique topics
    const topics = [...new Set(problems.flatMap(p => p.topics))].sort();
    
    // Count by company
    const byCompany = {};
    problems.forEach(p => {
      p.company.forEach(c => {
        byCompany[c] = (byCompany[c] || 0) + 1;
      });
    });
    
    // Top companies (most problems)
    const topCompanies = Object.entries(byCompany)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
    
    res.json({
      total: problems.length,
      byDifficulty,
      companies,
      topics,
      topCompanies
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/practice/:slug - Get specific problem
router.get('/:slug', (req, res) => {
  try {
    const problems = getProblemsData();
    const problem = problems.find(p => p.slug === req.params.slug);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

module.exports = router;
