const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Register User
const register = async (req, res) => {
    try {
        console.log('=== REGISTER REQUEST ===');
        console.log('Body:', req.body);
        const { username, email, password, firstName, lastName } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Kiểm tra user đã tồn tại chưa
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
        }

        // Tạo user mới
        const user = new User({
            username: username || email,
            email,
            password,
            firstName: firstName || 'User',
            lastName: lastName || ''
        });

        await user.save();
        console.log('User saved:', user._id);

        // Tạo token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login User
const login = async (req, res) => {
    try {
        console.log('=== LOGIN REQUEST ===');
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Kiểm tra user có tồn tại không
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Kiểm tra password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Tạo token
        const token = generateToken(user._id);
        console.log('Login successful:', email);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
};
