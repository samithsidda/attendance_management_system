const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@gmail.com' });
    
    if (!adminExists) {
      const admin = new Admin({
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: '123456', // The pre-save hook will hash this
        role: 'admin',
      });
      
      await admin.save();
      console.log('Default admin seeded.');
    } else {
      console.log('Admin already exists. Skipping seed.');
    }
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
  }
};

module.exports = seedAdmin;
