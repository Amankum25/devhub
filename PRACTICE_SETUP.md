# Practice Page Setup Guide

## Overview
The blog functionality has been replaced with a **Practice Page** featuring LeetCode problems organized by company, difficulty, and topics.

## What's Changed

### Removed:
- ❌ Blog pages (`Blog.jsx`, `BlogPost.jsx`, `BlogNew.jsx`, `BlogEdit.jsx`)
- ❌ Blog routes (`/blog`, `/blog/:slug`, etc.)
- ❌ Posts and Comments API routes
- ❌ Blog navigation item

### Added:
- ✅ Practice page (`Practice.jsx`)
- ✅ Practice API routes (`/api/practice`)
- ✅ LeetCode data fetching script
- ✅ Practice navigation item

## Installation & Setup

### 1. Install Dependencies (Already in package.json)
All required dependencies are already installed:
- axios (for API calls)
- fs, path (Node.js built-in)

### 2. Fetch LeetCode Data
Run the data fetcher script to populate the practice problems:

```bash
npm run fetch-leetcode
```

Or directly:
```bash
node scripts/fetch-leetcode-data.js
```

**Note:** This will take 10-20 minutes on first run as it:
1. Clones the LeetCode company-wise questions repository
2. Parses all markdown files
3. Fetches difficulty and topics from LeetCode API (with rate limiting)
4. Saves to `server/data/merged_problems.json`

### 3. Start the Server
```bash
npm run dev
```

The practice page will be available at:
- Frontend: http://localhost:8080/practice
- API: http://localhost:3000/api/practice

## Features

### Practice Page Features:
✅ **Filter by Difficulty** - Easy, Medium, Hard
✅ **Filter by Company** - Google, Amazon, Microsoft, etc.
✅ **Filter by Topic** - Array, Dynamic Programming, Trees, etc.
✅ **Search** - Find problems by name
✅ **Pagination** - Browse through 50 problems per page
✅ **Statistics** - View problem distribution
✅ **Direct LeetCode Links** - Click to solve on LeetCode

### API Endpoints:
- `GET /api/practice` - Get problems with filters
- `GET /api/practice/stats` - Get statistics
- `GET /api/practice/:slug` - Get specific problem

## Usage

### Frontend
Visit `/practice` in your browser to:
- Browse all LeetCode problems
- Filter by company, difficulty, or topic
- Search for specific problems
- Click to solve on LeetCode

### API Examples

**Get all problems:**
```bash
curl http://localhost:3000/api/practice
```

**Filter by company:**
```bash
curl "http://localhost:3000/api/practice?company=Google"
```

**Filter by difficulty:**
```bash
curl "http://localhost:3000/api/practice?difficulty=Easy"
```

**Search:**
```bash
curl "http://localhost:3000/api/practice?search=two+sum"
```

**Get statistics:**
```bash
curl http://localhost:3000/api/practice/stats
```

## Data Update

To refresh the LeetCode data (get new problems):

```bash
npm run fetch-leetcode
```

This will:
- Delete old data
- Fetch fresh problems
- Update difficulty/topics
- Keep your practice page current

## Troubleshooting

### No problems showing?
Run the data fetcher:
```bash
npm run fetch-leetcode
```

### API errors?
Check that MongoDB is running and the server started successfully.

### Rate limiting?
The script includes 400ms delays between API calls. If you get rate limited, the script will mark those problems as "Unknown" difficulty and continue.

## File Structure

```
scripts/
  ├── fetch-leetcode-data.js  # Data fetcher script
  └── README.md                # Script documentation

server/
  ├── data/
  │   └── merged_problems.json # LeetCode problems data
  └── routes/
      └── practice.js          # Practice API routes

client/
  └── pages/
      └── Practice.jsx         # Practice page component
```

## Notes

- The data fetcher requires Git installed on your system
- First run takes time due to rate limiting
- Data is stored locally in JSON format
- No database required for practice problems
- Direct links to LeetCode for solving problems
