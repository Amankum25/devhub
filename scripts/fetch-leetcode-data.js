const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

// Configuration
const REPO_URL = 'https://github.com/snehasishroy/leetcode-companywise-interview-questions';
const REPO_DIR = path.join(__dirname, 'temp_leetcode_repo');
const OUTPUT_FILE = path.join(__dirname, '..', 'server', 'data', 'merged_problems.json');
const DELAY_MS = 300;

const LEETCODE_API = 'https://leetcode.com/graphql';

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clone only if not already present
function ensureRepo() {
  if (fs.existsSync(path.join(REPO_DIR, 'google'))) {
    log('✓ Repo already present, skipping clone', 'green');
    return true;
  }
  try {
    log('\n📦 Cloning repository...', 'blue');
    if (fs.existsSync(REPO_DIR)) {
      fs.rmSync(REPO_DIR, { recursive: true, force: true });
    }
    execSync(`git clone --depth 1 ${REPO_URL} "${REPO_DIR}"`, { stdio: 'inherit' });
    log('✓ Repository cloned successfully', 'green');
    return true;
  } catch (error) {
    log(`✗ Failed to clone: ${error.message}`, 'red');
    return false;
  }
}

function extractSlug(url) {
  const match = url.match(/leetcode\.com\/problems\/([^\/\s,]+)/);
  return match ? match[1] : null;
}

async function fetchTopics(slug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        topicTags { name }
      }
    }
  `;
  try {
    const response = await axios.post(
      LEETCODE_API,
      { query, variables: { titleSlug: slug } },
      { headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' } }
    );
    const tags = response.data?.data?.question?.topicTags;
    return tags ? tags.map(t => t.name) : [];
  } catch {
    return [];
  }
}

// Parse all CSVs, merge by slug
function parseCSVFiles(directory) {
  const merged = new Map();

  for (const entry of fs.readdirSync(directory)) {
    const entryPath = path.join(directory, entry);
    if (!fs.statSync(entryPath).isDirectory()) continue;

    const companyName = entry
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    for (const csvFile of fs.readdirSync(entryPath).filter(f => f.endsWith('.csv'))) {
      const lines = fs.readFileSync(path.join(entryPath, csvFile), 'utf8').split('\n').slice(1);

      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(',');
        if (parts.length < 4) continue;

        const url = parts[1]?.trim();
        const title = parts[2]?.trim();
        const difficulty = parts[3]?.trim();

        if (!url || !title || !['Easy', 'Medium', 'Hard'].includes(difficulty)) continue;

        const slug = extractSlug(url);
        if (!slug) continue;

        if (merged.has(slug)) {
          const ex = merged.get(slug);
          if (!ex.companies.includes(companyName)) ex.companies.push(companyName);
        } else {
          merged.set(slug, {
            title,
            slug,
            link: `https://leetcode.com/problems/${slug}/`,
            difficulty,
            companies: [companyName],
            topics: [],
          });
        }
      }
    }
  }

  return Array.from(merged.values());
}

async function main() {
  log('\n🚀 LeetCode Data Compiler Started', 'blue');
  log('='.repeat(50), 'blue');

  if (!ensureRepo()) process.exit(1);

  log('\n📄 Parsing CSV files...', 'blue');
  const problems = parseCSVFiles(REPO_DIR);
  log(`✓ Found ${problems.length} unique problems across ${new Set(problems.flatMap(p => p.companies)).size} companies`, 'green');

  // Check if we already have a file with topics — skip problems already fetched
  let existingMap = new Map();
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      existing.forEach(p => {
        if (p.topics && p.topics.length > 0) existingMap.set(p.slug, p.topics);
      });
      log(`✓ Loaded ${existingMap.size} already-fetched topic sets from existing file`, 'green');
    } catch {}
  }

  const needFetch = problems.filter(p => !existingMap.has(p.slug));
  log(`\n🌐 Fetching topics for ${needFetch.length} problems (${existingMap.size} already cached)...`, 'blue');
  if (needFetch.length > 0) {
    log(`   Estimated time: ~${Math.ceil(needFetch.length * DELAY_MS / 60000)} minutes`, 'yellow');
  }

  let done = 0;
  for (const problem of problems) {
    if (existingMap.has(problem.slug)) {
      problem.topics = existingMap.get(problem.slug);
      continue;
    }

    const topics = await fetchTopics(problem.slug);
    problem.topics = topics;
    done++;

    process.stdout.write(`\r  [${done}/${needFetch.length}] Fetching: ${problem.slug.padEnd(55)}`);

    // Save progress every 50 problems so you don't lose data if interrupted
    if (done % 50 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(problems, null, 2), 'utf8');
    }

    if (done < needFetch.length) await sleep(DELAY_MS);
  }

  console.log();

  // Sort: Easy → Medium → Hard, then alphabetically
  const order = { Easy: 1, Medium: 2, Hard: 3 };
  problems.sort((a, b) => (order[a.difficulty] - order[b.difficulty]) || a.title.localeCompare(b.title));

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(problems, null, 2), 'utf8');

  log(`✓ Saved to: ${OUTPUT_FILE}`, 'green');

  // Summary
  const byDiff = problems.reduce((acc, p) => { acc[p.difficulty] = (acc[p.difficulty] || 0) + 1; return acc; }, {});
  const allTopics = new Set(problems.flatMap(p => p.topics));
  const allCompanies = new Set(problems.flatMap(p => p.companies));

  log('\n📊 Summary:', 'blue');
  log(`   Unique problems : ${problems.length}`, 'green');
  log(`   Companies       : ${allCompanies.size}`, 'green');
  log(`   Topic tags      : ${allTopics.size}`, 'green');
  Object.entries(byDiff).forEach(([d, c]) => log(`   ${d.padEnd(8)}: ${c}`, 'green'));
  log('\n✅ Done! This file is now permanent — no need to run this script again.', 'green');
  log('='.repeat(50), 'blue');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
