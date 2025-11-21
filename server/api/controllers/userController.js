const User = require('../models/userModel');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        console.log(`Admin ${req.user.username} fetched ${users.length} users`);
        res.json({
            success: true,
            users,
            total: users.length
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const { firstName, lastName, username, email, role, isActive } = req.body;

        // Không cho phép admin tự thay đổi role của chính mình
        if (id === req.user.id && role !== req.user.role) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { firstName, lastName, username, email, role, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Admin ${req.user.username} updated user ${user.username}`);
        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;

        // Không cho phép admin xóa chính mình
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Xóa tất cả vocab của user này
        const Vocab = require('../models/vocabModel');
        await Vocab.deleteMany({ createdBy: id });

        console.log(`Admin ${req.user.username} deleted user ${user.username}`);
        res.json({
            success: true,
            message: 'User and all their vocabs deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user stats (Admin only)
const getUserStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        
        const Vocab = require('../models/vocabModel');
        const totalVocabs = await Vocab.countDocuments();

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                adminUsers,
                totalVocabs
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    getUserStats
};
