const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

// Configuration
const REPO_URL = 'https://github.com/snehasishroy/leetcode-companywise-interview-questions';
const REPO_DIR = path.join(__dirname, 'temp_leetcode_repo');
const OUTPUT_FILE = path.join(__dirname, '..', 'server', 'data', 'merged_problems.json');
const DELAY_MS = 400; // Delay between API calls

// LeetCode GraphQL API
const LEETCODE_API = 'https://leetcode.com/graphql';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clone repository
async function cloneRepo() {
  try {
    log('\n📦 Cloning repository...', 'blue');
    
    // Remove existing repo if present
    if (fs.existsSync(REPO_DIR)) {
      fs.rmSync(REPO_DIR, { recursive: true, force: true });
    }
    
    execSync(`git clone --depth 1 ${REPO_URL} "${REPO_DIR}"`, { 
      stdio: 'inherit' 
    });
    
    log('✓ Repository cloned successfully', 'green');
    return true;
  } catch (error) {
    log(`✗ Failed to clone repository: ${error.message}`, 'red');
    return false;
  }
}

// Extract problem slug from URL
function extractSlug(url) {
  const match = url.match(/leetcode\.com\/problems\/([^\/\s]+)/);
  return match ? match[1] : null;
}

// Fetch problem details from LeetCode API
async function fetchProblemDetails(slug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
        topicTags {
          name
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      LEETCODE_API,
      {
        query,
        variables: { titleSlug: slug }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        }
      }
    );

    if (response.data?.data?.question) {
      const question = response.data.data.question;
      return {
        difficulty: question.difficulty || 'Unknown',
        topics: question.topicTags?.map(tag => tag.name) || []
      };
    }
    
    return null;
  } catch (error) {
    log(`  ⚠ API error for ${slug}: ${error.message}`, 'yellow');
    return null;
  }
}

// Parse CSV files
function parseCSVFiles(directory) {
  const problems = [];
  
  function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Directory name is the company name
        const companyName = file
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Look for CSV files in this directory
        const companyPath = filePath;
        const csvFiles = fs.readdirSync(companyPath).filter(f => f.endsWith('.csv'));
        
        for (const csvFile of csvFiles) {
          const csvPath = path.join(companyPath, csvFile);
          const content = fs.readFileSync(csvPath, 'utf8');
          
          // Parse CSV (skip header line)
          const lines = content.split('\n').slice(1);
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            // Parse CSV line (simple parsing - assuming no commas in values)
            const match = line.match(/^(\d+),(https:\/\/leetcode\.com\/problems\/[^,]+),([^,]+),(Easy|Medium|Hard)/i);
            
            if (match) {
              const [, id, link, title, difficulty] = match;
              const slug = extractSlug(link);
              
              if (slug) {
                problems.push({
                  title: title.trim(),
                  slug,
                  link: link.trim(),
                  company: companyName
                });
              }
            }
          }
        }
      }
    }
  }
  
  traverseDirectory(directory);
  return problems;
}

// Merge duplicate problems
function mergeProblems(problems) {
  const merged = new Map();
  
  for (const problem of problems) {
    if (merged.has(problem.slug)) {
      const existing = merged.get(problem.slug);
      if (!existing.company.includes(problem.company)) {
        existing.company.push(problem.company);
      }
    } else {
      merged.set(problem.slug, {
        title: problem.title,
        slug: problem.slug,
        link: problem.link,
        company: [problem.company],
        difficulty: 'Unknown',
        topics: []
      });
    }
  }
  
  return Array.from(merged.values());
}

// Main function
async function main() {
  log('\n🚀 LeetCode Data Fetcher Started', 'blue');
  log('='.repeat(50), 'blue');
  
  // Step 1: Clone repository
  const cloned = await cloneRepo();
  if (!cloned) {
    log('\n✗ Failed to clone repository. Exiting.', 'red');
    process.exit(1);
  }
  
  // Step 2: Parse CSV files
  log('\n📄 Parsing CSV files...', 'blue');
  const problems = parseCSVFiles(REPO_DIR);
  log(`✓ Found ${problems.length} problems`, 'green');
  
  // Step 3: Merge duplicate problems
  log('\n🔄 Merging duplicate problems...', 'blue');
  const mergedProblems = mergeProblems(problems);
  log(`✓ Merged to ${mergedProblems.length} unique problems`, 'green');
  
  // Step 4: Fetch details from LeetCode API
  log('\n🌐 Fetching problem details from LeetCode API...', 'blue');
  log(`   (This may take a while with rate limiting)`, 'yellow');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < mergedProblems.length; i++) {
    const problem = mergedProblems[i];
    const progress = `[${i + 1}/${mergedProblems.length}]`;
    
    process.stdout.write(`\r  ${progress} Fetching: ${problem.slug.padEnd(50)}`);
    
    const details = await fetchProblemDetails(problem.slug);
    
    if (details) {
      problem.difficulty = details.difficulty;
      problem.topics = details.topics;
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limiting
    if (i < mergedProblems.length - 1) {
      await sleep(DELAY_MS);
    }
  }
  
  console.log(); // New line after progress
  log(`✓ Successfully fetched ${successCount} problems`, 'green');
  if (failCount > 0) {
    log(`⚠ Failed to fetch ${failCount} problems (marked as Unknown)`, 'yellow');
  }
  
  // Step 5: Save to file
  log('\n💾 Saving data...', 'blue');
  
  // Ensure directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Sort by difficulty and title
  const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Unknown': 4 };
  mergedProblems.sort((a, b) => {
    const diffCompare = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    if (diffCompare !== 0) return diffCompare;
    return a.title.localeCompare(b.title);
  });
  
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(mergedProblems, null, 2),
    'utf8'
  );
  
  log(`✓ Data saved to: ${OUTPUT_FILE}`, 'green');
  
  // Step 6: Cleanup
  log('\n🧹 Cleaning up...', 'blue');
  if (fs.existsSync(REPO_DIR)) {
    fs.rmSync(REPO_DIR, { recursive: true, force: true });
  }
  log('✓ Temporary files removed', 'green');
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Summary:', 'blue');
  log(`   Total unique problems: ${mergedProblems.length}`, 'green');
  log(`   Successfully fetched: ${successCount}`, 'green');
  log(`   Failed/Unknown: ${failCount}`, failCount > 0 ? 'yellow' : 'green');
  
  // Count by difficulty
  const byCifficulty = mergedProblems.reduce((acc, p) => {
    acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
    return acc;
  }, {});
  
  log('\n   By difficulty:', 'blue');
  Object.entries(byCifficulty).forEach(([difficulty, count]) => {
    log(`     ${difficulty}: ${count}`, 'green');
  });
  
  log('\n✅ Done!', 'green');
  log('='.repeat(50), 'blue');
}

// Run the script
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
