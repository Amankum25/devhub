const mongoose = require('mongoose');
const User = require('./server/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devhub');

async function createChatTestUsers() {
  try {
    const testUsers = [
      {
        email: 'alice.chat@example.com',
        firstName: 'Alice',
        lastName: 'Developer',
        username: 'alicedev',
        password: 'test123',
        authProvider: 'local'
      },
      {
        email: 'bob.chat@example.com',
        firstName: 'Bob',
        lastName: 'Coder',
        username: 'bobcoder',
        password: 'test123',
        authProvider: 'local'
      }
    ];

    console.log('🔧 Creating chat test users...\n');

    for (const userData of testUsers) {
      try {
        const existingUser = await User.findOne({ 
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        });

        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`);
          console.log(`   Email: ${userData.email}`);
          console.log(`   Username: @${userData.username}`);
          console.log(`   Password: ${userData.password}\n`);
        } else {
          console.log(`⚠️  User already exists: ${userData.username}\n`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.username}:`, error.message);
      }
    }

    console.log('🧪 Test the chat with these accounts:');
    console.log('');
    console.log('User 1:');
    console.log('  Email: testchat@example.com');
    console.log('  Password: password123');
    console.log('');
    console.log('User 2:');
    console.log('  Email: alice.chat@example.com');
    console.log('  Password: test123');
    console.log('');
    console.log('User 3:');
    console.log('  Email: bob.chat@example.com');
    console.log('  Password: test123');
    console.log('');
    console.log('🚀 Testing steps:');
    console.log('1. Open http://localhost:8080 in two browser windows (or incognito)');
    console.log('2. Login as different users in each window');
    console.log('3. Go to Chat → Direct Messages tab');
    console.log('4. Use the search to find other users');
    console.log('5. Start conversations and send messages!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createChatTestUsers();
