#!/usr/bin/env node

const { exec, execSync } = require('child_process');
const net = require('net');

const PREFERRED_PORT = 3001;

function killProcessOnPort(port) {
  return new Promise((resolve) => {
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
      
      console.log(`⚠️  Port ${port} is busy, cleaning up...`);
      
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolvePid) => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (!killError) {
              console.log(`✅ Freed port ${port} (killed PID ${pid})`);
            }
            resolvePid();
          });
        });
      });
      
      Promise.all(killPromises).then(() => {
        setTimeout(resolve, 500);
      });
    });
  });
}

async function cleanupAndStart() {
  console.log('🧹 Cleaning up development ports...');
  
  // Clean up specific ports that might conflict
  await killProcessOnPort(3001);
  await killProcessOnPort(3002);
  await killProcessOnPort(3003);
  
  console.log('✨ Port cleanup complete!');
  console.log('🚀 Starting DevHub server...');
  
  // Wait a moment for ports to be freed, then start server
  setTimeout(() => {
    require('./app.js');
  }, 1000);
}

cleanupAndStart().catch(error => {
  console.error('❌ Error during startup:', error.message);
  process.exit(1);
});
