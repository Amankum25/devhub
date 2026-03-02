// Quick MongoDB Atlas Connection Test
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://bt23cse058_db_user:w6AhULoH9ZTw3t5r@cluster0.s9e31kx.mongodb.net/devhub?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 Testing MongoDB Atlas connection...\n');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Atlas connection works!');
    console.log('📊 Connection details:');
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    console.log('\n🚀 Ready to deploy!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ FAILED! Connection error:');
    console.error('   ', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check Network Access allows 0.0.0.0/0');
    console.log('   2. Verify database user password is correct');
    console.log('   3. Make sure cluster is active (not paused)\n');
    process.exit(1);
  });
