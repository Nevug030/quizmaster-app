const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['einfach', 'mittel', 'schwer'],
    index: true
  },
  question: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index für bessere Performance
questionSchema.index({ category: 1, difficulty: 1, isActive: 1 });

module.exports = mongoose.model('Question', questionSchema); 