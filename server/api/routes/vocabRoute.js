const VocabController = require("../controllers/vocabController")
const { auth } = require("../middlware/auth")

const VocabRoute = (app) => {
   app.route('/vocabs')
      .get(auth, VocabController.viewAllVocabs)
      .post(auth, VocabController.createVocab)

   app.route('/vocabs/:id')
      .get(auth, VocabController.viewVocabById)
      .put(auth, VocabController.updateVocab)
      .delete(auth, VocabController.deleteVocab)
}

module.exports = VocabRoute