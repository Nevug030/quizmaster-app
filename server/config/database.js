const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster';

const connectDB = async () => {
  try {
    console.log('🔌 Verbinde mit MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB erfolgreich verbunden');
  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 