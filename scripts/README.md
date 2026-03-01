# LeetCode Data Fetcher

This script automatically builds a merged LeetCode dataset for the practice page.

## Installation

```bash
npm install
```

Required dependencies (already in main package.json):
- axios
- fs
- path

## Usage

Run the script from the project root:

```bash
node scripts/fetch-leetcode-data.js
```

## What it does

1. **Clones Repository**: Downloads the LeetCode company-wise questions repository
2. **Parses Markdown**: Extracts problem titles, links, and company names
3. **Fetches Details**: Gets difficulty and topic tags from LeetCode GraphQL API
4. **Merges Data**: Combines problems from multiple companies
5. **Saves Output**: Creates `server/data/merged_problems.json`

## Output Format

```json
[
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "link": "https://leetcode.com/problems/two-sum/",
    "company": ["Google", "Amazon", "Microsoft"],
    "difficulty": "Easy",
    "topics": ["Array", "Hash Table"]
  }
]
```

## Rate Limiting

The script includes a 400ms delay between API calls to respect LeetCode's rate limits.

## Error Handling

If the API fails for a problem, it will still be included with:
- `difficulty: "Unknown"`
- `topics: []`

## Progress

The script shows real-time progress:
- Problem count during parsing
- API fetch progress with counter
- Summary statistics at the end

## Notes

- First run may take 10-20 minutes depending on problem count
- Requires Git installed on your system
- Temporary repository is automatically cleaned up after completion
