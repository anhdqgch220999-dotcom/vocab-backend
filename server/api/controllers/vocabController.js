const Vocab = require('../models/vocabModel')

const viewAllVocabs = async (req, res) => {
   try {
      // View ALL vocabs from all users (no createdBy filter)
      console.log('Fetching all vocabs...');
      const vocabs = await Vocab.find({})
         .populate('createdBy', 'firstName lastName username email')
         .sort({ _id: -1 })
      
      console.log(`Found ${vocabs.length} vocabs total`);
      if (vocabs.length > 0) {
         console.log('First vocab createdBy:', vocabs[0].createdBy);
      }
      
      res.json({ vocabs })
   } catch (err) {
      console.error('Error fetching vocabs:', err);
      res.status(500).send(err)
   }
}

const createVocab = async (req, res) => {
   try {
      const vocabData = {
         sourceLanguage: req.body.sourceLanguage || 'en',
         definition: req.body.definition || '',
         example: req.body.example || '',
         usedLanguages: req.body.usedLanguages || ['en', 'de'],
         createdBy: req.user.id
      };

      // Process translations
      if (req.body.translations && typeof req.body.translations === 'object') {
         const cleanTranslations = {};
         Object.keys(req.body.translations).forEach(key => {
            const value = req.body.translations[key];
            if (value && typeof value === 'string' && value.trim() !== '') {
               cleanTranslations[key] = value.trim();
            }
         });
         
         if (Object.keys(cleanTranslations).length > 0) {
            vocabData.translations = cleanTranslations;
         } else {
            return res.status(400).json({ error: 'No valid translations provided' });
         }
      } else {
         return res.status(400).json({ error: 'Translations object is required' });
      }
      
      const vocab = new Vocab(vocabData);
      const savedVocab = await vocab.save();
      
      const populatedVocab = await Vocab.findById(savedVocab._id)
         .populate('createdBy', 'firstName lastName username email')
      
      res.status(201).json(populatedVocab)
   } catch (err) {
      console.error('Error creating vocab:', err);
      res.status(400).json({ error: err.message })
   }
}

const viewVocabById = async (req, res) => {
   try {
      // Allow viewing any vocab, not just own (no createdBy filter)
      const vocab = await Vocab.findById(req.params.id)
         .populate('createdBy', 'firstName lastName username email')
      
      if (!vocab) {
         return res.status(404).send('Vocab not found')
      }
      
      console.log('Vocab found by:', vocab.createdBy.firstName);
      res.json(vocab)
   } catch (err) {
      console.error('Error fetching vocab by ID:', err);
      res.status(500).send(err)
   }
}

const updateVocab = async (req, res) => {
   try {
      const updateData = {
         sourceLanguage: req.body.sourceLanguage || 'en',
         definition: req.body.definition || '',
         example: req.body.example || '',
         usedLanguages: req.body.usedLanguages || ['en', 'de']
      };
      
      // Process translations
      if (req.body.translations && typeof req.body.translations === 'object') {
         const cleanTranslations = {};
         Object.keys(req.body.translations).forEach(key => {
            const value = req.body.translations[key];
            if (value !== undefined) {
               cleanTranslations[key] = value || '';
            }
         });
         updateData.translations = cleanTranslations;
      }
      
      const vocab = await Vocab.findOneAndUpdate(
         { _id: req.params.id, createdBy: req.user.id },
         updateData,
         { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName username email');
      
      if (!vocab) {
         return res.status(404).send('Vocab not found')
      }
      
      res.json(vocab)
   } catch (err) {
      console.error('Error updating vocab:', err);
      res.status(400).json({ error: err.message })
   }
}

const deleteVocab = async (req, res) => {
   try {
      const vocab = await Vocab.findOneAndDelete({ 
         _id: req.params.id, 
         createdBy: req.user.id 
      })
      if (!vocab) {
         return res.status(404).send('Vocab not found')
      }
      res.json(vocab)
   } catch (err) {
      res.status(500).send(err)
   }
}

module.exports = {
   viewAllVocabs,
   viewVocabById,
   createVocab,
   updateVocab,
   deleteVocab
}