const mongoose = require('mongoose');
const User = require('./server/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devhub');

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...\n');

    // Get all users
    const users = await User.find().select('firstName lastName username email');
    
    console.log(`📋 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Username: @${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log('');
    });

    // Check specifically for "ayush"
    console.log('🔍 Searching for users with "ayush" in their name or username...\n');
    
    const ayushUsers = await User.find({
      $or: [
        { firstName: { $regex: 'ayush', $options: 'i' } },
        { lastName: { $regex: 'ayush', $options: 'i' } },
        { username: { $regex: 'ayush', $options: 'i' } }
      ]
    }).select('firstName lastName username email');

    if (ayushUsers.length > 0) {
      console.log(`✅ Found ${ayushUsers.length} users matching "ayush":`);
      ayushUsers.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (@${user.username}) - ${user.email}`);
      });
    } else {
      console.log('❌ No users found with "ayush" in their name or username');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
