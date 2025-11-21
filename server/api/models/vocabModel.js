const mongoose = require('mongoose')

const VocabSchema = mongoose.Schema(
   {
      // Đổi từ Map sang Object để tránh vấn đề serialize
      translations: {
         type: Object,
         required: true,
         default: {},
         validate: {
            validator: function(v) {
               return v && typeof v === 'object' && !Array.isArray(v);
            },
            message: 'Translations must be a valid object'
         }
      },
      // Ngôn ngữ gốc (source language)
      sourceLanguage: {
         type: String,
         required: true,
         default: 'en'
      },
      // Lưu danh sách ngôn ngữ được sử dụng
      usedLanguages: {
         type: [String],
         required: true,
         default: ['en', 'de']
      },
      // Thông tin về người tạo (hiển thị rõ ràng)
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true
      },
      // Chỉ giữ những trường cần thiết
      definition: {
         type: String,
         default: ""
      },
      example: {
         type: String,
         default: ""
      }
      // Loại bỏ hoàn toàn english/german fields để tránh conflict
   },
   {
      versionKey: false,
      timestamps: true
   }
)

const Vocab = mongoose.model("vocabs", VocabSchema)
module.exports = Vocab