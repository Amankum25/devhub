const mongoose = require('mongoose');
const User = require('./server/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devhub');

async function createTestUsers() {
  try {
    // Check if users already exist
    const existingUsers = await User.find().limit(5);
    console.log(`Found ${existingUsers.length} existing users:`);
    existingUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (@${user.username}) - ${user.email}`);
    });

    if (existingUsers.length < 3) {
      console.log('\nCreating additional test users...');
      
      const testUsers = [
        {
          email: 'alice.dev@example.com',
          firstName: 'Alice',
          lastName: 'Johnson',
          username: 'alice_dev',
          password: 'password123',
          authProvider: 'local'
        },
        {
          email: 'bob.coder@example.com',
          firstName: 'Bob',
          lastName: 'Smith',
          username: 'bob_coder',
          password: 'password123',
          authProvider: 'local'
        },
        {
          email: 'carol.tech@example.com',
          firstName: 'Carol',
          lastName: 'White',
          username: 'carol_tech',
          password: 'password123',
          authProvider: 'local'
        }
      ];

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
            console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (@${userData.username})`);
          } else {
            console.log(`⚠️  User already exists: ${userData.username}`);
          }
        } catch (error) {
          console.error(`❌ Error creating user ${userData.username}:`, error.message);
        }
      }
    }

    // Show all users for testing
    const allUsers = await User.find().select('firstName lastName username email');
    console.log(`\n📋 All users available for chat testing (${allUsers.length} total):`);
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (@${user.username}) - ${user.email}`);
    });

    console.log('\n🧪 To test the chat:');
    console.log('1. Go to http://localhost:8080');
    console.log('2. Login with any of the above users (password: "password123")');
    console.log('3. Navigate to Chat → Direct Messages tab');
    console.log('4. Click the "+" button to search for other users');
    console.log('5. Start a conversation and send messages!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUsers();
