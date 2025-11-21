
const Language = require('../models/languageModel');

const getActiveLanguages = async (req, res) => {
    try {
        const languages = await Language.find({isActive: true})
            .sort({name: 1});
        
        res.json({
            success: true,
            languages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllLanguages = async (req, res) => {
    try{
        const languages = await Language.find()
            .populate('addedBy','firstName lastName')
            .sort({createdAt: -1});

        res.json({
            success: true,
            languages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addLanguage = async (req, res) => {
    try{
        const {code, name,flag} = req.body;

        const existingLanguage = await Language.findOne({code});
        if (existingLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Language already exists'
            });
        }

        const language = new Language({
            code,
            name,
            flag,
            addedBy: req.user._id
        });

        await language.save();

        res.status(201).json({
            success: true,
            message: 'Language added successfully',
            language
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateLanguage = async (req, res) => {
    try{
        const {id} = req.params;
        const {name, flag, isActive} = req.body;

        const language = await Language.findByIdAndUpdate(
            id,
            {name, flag, isActive},
            {new: true}
        );

        if (!language) {
            return res.status(404).json({
                success: false,
                message: 'Language not found'
            })
        }

        res.json({
            success: true,
            message: 'Language updated successfully',
            language
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateLanguageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Prevent deactivating English (required language)
        const language = await Language.findById(id);
        if (!language) {
            return res.status(404).json({
                success: false,
                message: 'Language not found'
            });
        }

        if (language.code === 'en' && !isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate English language'
            });
        }

        const updatedLanguage = await Language.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        res.json({
            success: true,
            message: `Language ${isActive ? 'activated' : 'deactivated'} successfully`,
            language: updatedLanguage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteLanguage = async (req,res) => {
    try{
        const {id} = req.params;
        const language = await Language.findById(id);

        if(!language) {
            return res.status(404).json({
                success: false,
                message: 'Language not found'
            });
        }

        // Prevent deleting English (required language)
        if (language.code === 'en') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete English language'
            });
        }

        await Language.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Language deleted successfully'
        });
    }catch (error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Initialize default languages
const initializeDefaultLanguages = async () => {
    try {
        const count = await Language.countDocuments();
        if (count === 0) {
            const defaultLanguages = [
                { code: 'en', name: 'English', flag: 'us', isActive: true },
                { code: 'de', name: 'German', flag: 'de', isActive: true },
                { code: 'fr', name: 'French', flag: 'fr', isActive: true },
                { code: 'es', name: 'Spanish', flag: 'es', isActive: true },
                { code: 'it', name: 'Italian', flag: 'it', isActive: true },
                { code: 'pt', name: 'Portuguese', flag: 'pt', isActive: true },
                { code: 'ja', name: 'Japanese', flag: 'jp', isActive: true },
                { code: 'ko', name: 'Korean', flag: 'kr', isActive: true },
                { code: 'zh', name: 'Chinese', flag: 'cn', isActive: true },
                { code: 'vi', name: 'Vietnamese', flag: 'vn', isActive: true }
            ];

            // Create a default admin user ID (you'll need to replace this with actual admin ID)
            const User = require('../models/userModel');
            let defaultUser = await User.findOne({ role: 'admin' });
            if (!defaultUser) {
                defaultUser = await User.findOne(); // Use first user as fallback
            }

            if (defaultUser) {
                const languagesWithUser = defaultLanguages.map(lang => ({
                    ...lang,
                    addedBy: defaultUser._id
                }));

                await Language.insertMany(languagesWithUser);
                console.log('Default languages initialized');
            }
        }
    } catch (error) {
        console.error('Error initializing default languages:', error);
    }
};

module.exports = {
    getActiveLanguages,
    getAllLanguages,
    addLanguage,
    updateLanguage,
    updateLanguageStatus,
    deleteLanguage,
    initializeDefaultLanguages
};


