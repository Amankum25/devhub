const mongoose = require('mongoose');
const User = require('./server/models/User');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devhub');

async function checkUsers() {
  try {
    // Get all users and check their auth provider and password setup
    const users = await User.find().select('firstName lastName username email authProvider password');
    
    console.log(`📋 Found ${users.length} users in database:\n`);
    
    for (const user of users) {
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`   Username: @${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Auth Provider: ${user.authProvider}`);
      console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
      
      // Check if password is hashed (bcrypt hashes start with $2b$)
      if (user.password) {
        const isHashed = user.password.startsWith('$2b$');
        console.log(`   Password Type: ${isHashed ? 'Hashed (bcrypt)' : 'Plain text'}`);
        
        if (!isHashed && user.password === 'password123') {
          console.log(`   ✅ Can login with: password123`);
        } else if (isHashed) {
          console.log(`   ℹ️  Password is hashed - need to check original registration`);
        }
      }
      console.log('');
    }

    // Try to create a test user with known credentials
    console.log('🔧 Creating a test user with known password...');
    
    const testUser = {
      email: 'testchat@example.com',
      firstName: 'Chat',
      lastName: 'Tester',
      username: 'chattester',
      password: 'password123',
      authProvider: 'local'
    };

    const existingTestUser = await User.findOne({ 
      $or: [
        { email: testUser.email },
        { username: testUser.username }
      ]
    });

    if (!existingTestUser) {
      const user = new User(testUser);
      await user.save();
      console.log(`✅ Created test user: ${testUser.firstName} ${testUser.lastName} (@${testUser.username})`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
    } else {
      console.log(`⚠️  Test user already exists: ${testUser.username}`);
    }

    console.log('\n🧪 To test chat, try logging in with:');
    console.log('Email: testchat@example.com');
    console.log('Password: password123');
    
    // Also show the admin user info
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log('\n👑 Or try the admin account:');
      console.log('Email: admin@devhub.com');
      console.log('Username: admin');
      console.log('(Check the original setup for admin password)');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
