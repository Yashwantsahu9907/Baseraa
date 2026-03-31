const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const adminEmail = 'admin@basera.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('Admin already exists.');
            process.exit(0);
        }

        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: 'admin123',
            role: 'Admin',
            phone: '0000000000'
        });

        console.log('Admin account created successfully!');
        console.log('Email: admin@basera.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
