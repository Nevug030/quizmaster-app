const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// MongoDB Models
const Question = require('./models/Question');
const Category = require('./models/Category');
const Blacklist = require('./models/Blacklist');

// Database connection
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration für Netlify
const corsOptions = {
  origin: [
    'https://nevugs-quizmaster.netlify.app',
    'https://quizmaster-app.netlify.app',
    'https://*.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Preflight requests für CORS
app.options('*', cors(corsOptions));

// CORS Headers für alle Responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://nevugs-quizmaster.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// API Endpoints

// Alle Kategorien abrufen
app.get('/api/categories', async (req, res) => {
  // CORS Headers
  res.header('Access-Control-Allow-Origin', 'https://nevugs-quizmaster.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('❌ Fehler beim Laden der Kategorien:', error.message);
    res.status(500).json({ error: 'Fehler beim Laden der Kategorien' });
  }
});

// Fragen nach Kategorie und Schwierigkeit abrufen
app.get('/api/questions', async (req, res) => {
  try {
    const { categories, difficulties } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (categories) {
      const categoryArray = categories.split(',');
      query.category = { $in: categoryArray };
    }
    
    if (difficulties) {
      const difficultyArray = difficulties.split(',');
      query.difficulty = { $in: difficultyArray };
    }
    
    // Get blacklisted question IDs
    const blacklistedQuestions = await Blacklist.find({}, 'questionId');
    const blacklistedIds = blacklistedQuestions.map(b => b.questionId);
    
    // Exclude blacklisted questions
    if (blacklistedIds.length > 0) {
      query.questionId = { $nin: blacklistedIds };
    }
    
    console.log(`📊 Fragen-Request: ${Object.keys(query).length} Filter, ${blacklistedIds.length} Blacklist-Einträge`);
    
    const questions = await Question.find(query);
    console.log(`✅ ${questions.length} Fragen gefunden`);
    
    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    
    res.json(shuffledQuestions);
  } catch (error) {
    console.error(`❌ Fehler beim Laden der Fragen: ${error.message}`);
    res.status(500).json({ error: 'Fehler beim Laden der Fragen' });
  }
});

// Neue Kategorie hinzufügen
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, difficulties } = req.body;
    
    const categoryId = name.toLowerCase().replace(/\s+/g, '-');
    
    const existingCategory = await Category.findOne({ categoryId });
    if (existingCategory) {
      return res.status(400).json({ error: 'Kategorie existiert bereits' });
    }
    
    const newCategory = await Category.create({
      categoryId,
      name,
      description,
      difficulties: difficulties || ['einfach', 'mittel', 'schwer']
    });
    
    console.log(`✅ Neue Kategorie erstellt: ${name}`);
    res.json(newCategory);
  } catch (error) {
    console.error('❌ Fehler beim Hinzufügen der Kategorie:', error.message);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Kategorie' });
  }
});

// Neue Frage hinzufügen
app.post('/api/questions', async (req, res) => {
  try {
    const { category, difficulty, question, correctAnswer } = req.body;
    
    const questionId = `${category.substring(0, 2)}${difficulty.substring(0, 1)}${Date.now()}`;
    
    const newQuestion = await Question.create({
      questionId,
      category,
      difficulty,
      question,
      correctAnswer
    });
    
    // Update category question count
    await Category.updateOne(
      { categoryId: category },
      { $inc: { questionCount: 1 } }
    );
    
    console.log(`✅ Neue Frage erstellt: ${questionId}`);
    res.json(newQuestion);
  } catch (error) {
    console.error('❌ Fehler beim Hinzufügen der Frage:', error.message);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Frage' });
  }
});

// Blacklist abrufen
app.get('/api/blacklist', async (req, res) => {
  try {
    console.log('📋 Blacklist-Request erhalten');
    const blacklist = await Blacklist.find().sort({ createdAt: -1 });
    console.log(`📤 Sende Blacklist mit ${blacklist.length} Einträgen`);
    res.json(blacklist);
  } catch (error) {
    console.error(`❌ Fehler beim Laden der Blacklist: ${error.message}`);
    res.status(500).json({ error: 'Fehler beim Laden der Blacklist' });
  }
});

// Frage zur Blacklist hinzufügen
app.post('/api/blacklist', async (req, res) => {
  try {
    const { questionId, reason } = req.body;
    console.log(`🚫 Füge Frage zur Blacklist hinzu: ${questionId}`);
    
    if (!questionId) {
      return res.status(400).json({ error: 'questionId ist erforderlich' });
    }
    
    // Check if already blacklisted
    const existingBlacklist = await Blacklist.findOne({ questionId });
    if (existingBlacklist) {
      return res.json({ 
        success: true, 
        blacklist: await Blacklist.find(),
        message: 'Frage ist bereits in der Blacklist'
      });
    }
    
    // Get question details
    const question = await Question.findOne({ questionId });
    if (!question) {
      return res.status(404).json({ error: 'Frage nicht gefunden' });
    }
    
    // Add to blacklist
    await Blacklist.create({
      questionId,
      category: question.category,
      difficulty: question.difficulty,
      questionText: question.question,
      correctAnswer: question.correctAnswer,
      reason: reason || 'Manuell gesperrt'
    });
    
    console.log(`✅ Frage ${questionId} zur Blacklist hinzugefügt`);
    
    const updatedBlacklist = await Blacklist.find();
    res.json({ success: true, blacklist: updatedBlacklist });
  } catch (error) {
    console.error(`❌ Fehler beim Hinzufügen zur Blacklist: ${error.message}`);
    res.status(500).json({ error: 'Fehler beim Hinzufügen zur Blacklist' });
  }
});

// Frage von Blacklist entfernen
app.delete('/api/blacklist/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    console.log(`✅ Entferne Frage von Blacklist: ${questionId}`);
    
    const result = await Blacklist.deleteOne({ questionId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Blacklist-Eintrag nicht gefunden' });
    }
    
    console.log(`✅ Frage ${questionId} von Blacklist entfernt`);
    
    const updatedBlacklist = await Blacklist.find();
    res.json({ success: true, blacklist: updatedBlacklist });
  } catch (error) {
    console.error(`❌ Fehler beim Entfernen von der Blacklist: ${error.message}`);
    res.status(500).json({ error: 'Fehler beim Entfernen von der Blacklist' });
  }
});

// Migration endpoint (for development)
app.post('/api/migrate', async (req, res) => {
  try {
    const { runMigration } = require('./utils/migration');
    await runMigration();
    res.json({ success: true, message: 'Migration abgeschlossen' });
  } catch (error) {
    console.error('❌ Migration fehlgeschlagen:', error.message);
    res.status(500).json({ error: 'Migration fehlgeschlagen' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const questionCount = await Question.countDocuments();
    const categoryCount = await Category.countDocuments();
    const blacklistCount = await Blacklist.countDocuments();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      stats: {
        questions: questionCount,
        categories: categoryCount,
        blacklist: blacklistCount
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Server starten
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Run migration if needed
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      console.log('🔄 Keine Fragen in DB gefunden, starte Migration...');
      const { runMigration } = require('./utils/migration');
      await runMigration();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Quizmaster-Server läuft auf Port ${PORT}`);
      console.log(`📊 API verfügbar unter http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Server-Start fehlgeschlagen:', error.message);
    process.exit(1);
  }
}

startServer(); 