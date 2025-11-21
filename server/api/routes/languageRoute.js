const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middlware/auth');

const {
    getActiveLanguages,
    getAllLanguages,
    addLanguage,
    updateLanguage,
    updateLanguageStatus,
    deleteLanguage
} = require('../controllers/languageController');

// User routes
router.get('/active', auth, getActiveLanguages);

// Admin routes
router.get('/all', auth, requireAdmin, getAllLanguages);
router.post('/', auth, requireAdmin, addLanguage);
router.put('/:id', auth, requireAdmin, updateLanguage);
router.put('/:id/status', auth, requireAdmin, updateLanguageStatus);
router.delete('/:id', auth, requireAdmin, deleteLanguage);

module.exports = router;
