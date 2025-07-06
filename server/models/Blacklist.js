const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reason: {
    type: String,
    default: 'Manuell gesperrt'
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['einfach', 'mittel', 'schwer']
  },
  questionText: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index für bessere Performance
blacklistSchema.index({ questionId: 1 });
blacklistSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Blacklist', blacklistSchema); 