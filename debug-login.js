const mongoose = require('mongoose');
const User = require('./server/models/User');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devhub');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login process...\n');

    // Test with our created user
    const testEmail = 'testchat@example.com';
    const testPassword = 'password123';

    console.log(`Looking for user with email: ${testEmail}`);
    const user = await User.findOne({ email: testEmail }).select('+password');

    if (!user) {
      console.log('❌ User not found!');
      
      // Let's create the user properly
      console.log('\n🔧 Creating test user with proper password hashing...');
      const newUser = new User({
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser123',
        password: testPassword,
        authProvider: 'local'
      });

      await newUser.save();
      console.log('✅ User created successfully!');

      // Now test again
      const savedUser = await User.findOne({ email: testEmail }).select('+password');
      if (savedUser) {
        console.log(`✅ User found: ${savedUser.firstName} ${savedUser.lastName}`);
        console.log(`   Password hash: ${savedUser.password.substring(0, 20)}...`);
        
        // Test password comparison
        const isMatch = await bcrypt.compare(testPassword, savedUser.password);
        console.log(`   Password comparison result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      }
    } else {
      console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Auth Provider: ${user.authProvider}`);
      console.log(`   Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'}`);
      console.log(`   Is Active: ${user.isActive}`);

      if (user.password) {
        // Test password comparison
        console.log(`\n🔑 Testing password comparison...`);
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`   Input password: "${testPassword}"`);
        console.log(`   Comparison result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

        // Also test with different passwords to verify bcrypt is working
        const wrongMatch = await bcrypt.compare('wrongpassword', user.password);
        console.log(`   Wrong password test: ${wrongMatch ? '❌ INCORRECTLY MATCHED' : '✅ CORRECTLY REJECTED'}`);
      }
    }

    // Also check all our test users
    console.log('\n📋 All test users:');
    const testUsers = await User.find({
      email: { $in: ['testchat@example.com', 'alice.chat@example.com', 'bob.chat@example.com'] }
    }).select('+password');

    for (const user of testUsers) {
      console.log(`\n👤 ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Password exists: ${!!user.password}`);
      console.log(`   Is hashed: ${user.password && user.password.startsWith('$2b$')}`);
      console.log(`   Is active: ${user.isActive}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugLogin();
