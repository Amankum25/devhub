const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

async function fixAdminPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/devhub');
    console.log('Connected to MongoDB');

    const newPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('Generated hash:', hashedPassword);

    const result = await User.updateOne(
      { email: 'admin@devhub.com' }, 
      { $set: { password: hashedPassword } }
    );
    console.log('Update result:', result);

    // Test the hash
    const testComparison = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Test comparison:', testComparison);

    // Verify in database
    const adminUser = await User.findOne({ email: 'admin@devhub.com' }).select('+password');
    const dbComparison = await bcrypt.compare(newPassword, adminUser.password);
    console.log('Database comparison:', dbComparison);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminPassword();
