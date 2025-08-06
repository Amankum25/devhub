const { exec } = require('child_process');
const net = require('net');

// Ports we want to clean up
const PORTS_TO_CLEAN = [3000, 3001, 3002, 3003, 8080, 8081];

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    // For Windows
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        resolve();
        return;
      }
      
      const lines = stdout.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
          const pid = parts[4];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      
      if (pids.size === 0) {
        resolve();
        return;
      }
      
      console.log(`🧹 Cleaning up port ${port}...`);
      
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolvePid) => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (!killError) {
              console.log(`  ✅ Killed process ${pid} on port ${port}`);
            }
            resolvePid();
          });
        });
      });
      
      Promise.all(killPromises).then(() => resolve());
    });
  });
}

async function cleanupPorts() {
  console.log('🔄 Cleaning up development ports...');
  
  for (const port of PORTS_TO_CLEAN) {
    await killProcessOnPort(port);
  }
  
  console.log('✨ Port cleanup complete!');
  
  // Wait a moment for ports to be fully released
  await new Promise(resolve => setTimeout(resolve, 1000));
}

if (require.main === module) {
  cleanupPorts().then(() => {
    console.log('🚀 Ready to start development servers!');
    process.exit(0);
  });
}

module.exports = { cleanupPorts };
