// Fast startup - no port cleanup needed
async function cleanupPorts() {
  console.log('🚀 Starting development servers...');
}

if (require.main === module) {
  cleanupPorts().then(() => process.exit(0));
}

module.exports = { cleanupPorts };
