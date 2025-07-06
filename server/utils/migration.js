const fs = require('fs').promises;
const path = require('path');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Blacklist = require('../models/Blacklist');

const DATA_DIR = path.join(__dirname, '../data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');

async function loadJSONData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`⚠️ Datei nicht gefunden: ${filePath}`);
    return [];
  }
}

async function migrateCategories() {
  console.log('📚 Migriere Kategorien...');
  
  try {
    const categories = await loadJSONData(CATEGORIES_FILE);
    
    for (const category of categories) {
      const existingCategory = await Category.findOne({ categoryId: category.id });
      
      if (!existingCategory) {
        await Category.create({
          categoryId: category.id,
          name: category.name,
          description: category.description,
          difficulties: category.difficulties
        });
        console.log(`✅ Kategorie migriert: ${category.name}`);
      } else {
        console.log(`ℹ️ Kategorie bereits vorhanden: ${category.name}`);
      }
    }
    
    console.log('✅ Kategorien-Migration abgeschlossen');
  } catch (error) {
    console.error('❌ Fehler bei Kategorien-Migration:', error.message);
  }
}

async function migrateQuestions() {
  console.log('❓ Migriere Fragen...');
  
  try {
    const questions = await loadJSONData(QUESTIONS_FILE);
    
    for (const question of questions) {
      const existingQuestion = await Question.findOne({ questionId: question.id });
      
      if (!existingQuestion) {
        await Question.create({
          questionId: question.id,
          category: question.category,
          difficulty: question.difficulty,
          question: question.question,
          correctAnswer: question.correctAnswer,
          options: question.options
        });
        console.log(`✅ Frage migriert: ${question.id}`);
      } else {
        console.log(`ℹ️ Frage bereits vorhanden: ${question.id}`);
      }
    }
    
    console.log('✅ Fragen-Migration abgeschlossen');
  } catch (error) {
    console.error('❌ Fehler bei Fragen-Migration:', error.message);
  }
}

async function migrateBlacklist() {
  console.log('🚫 Migriere Blacklist...');
  
  try {
    const blacklist = await loadJSONData(BLACKLIST_FILE);
    
    for (const questionId of blacklist) {
      const existingBlacklistEntry = await Blacklist.findOne({ questionId });
      
      if (!existingBlacklistEntry) {
        // Frage-Details laden
        const question = await Question.findOne({ questionId });
        
        if (question) {
          await Blacklist.create({
            questionId: question.questionId,
            category: question.category,
            difficulty: question.difficulty,
            questionText: question.question,
            correctAnswer: question.correctAnswer,
            reason: 'Migriert von JSON-Blacklist'
          });
          console.log(`✅ Blacklist-Eintrag migriert: ${questionId}`);
        } else {
          console.log(`⚠️ Frage nicht gefunden für Blacklist: ${questionId}`);
        }
      } else {
        console.log(`ℹ️ Blacklist-Eintrag bereits vorhanden: ${questionId}`);
      }
    }
    
    console.log('✅ Blacklist-Migration abgeschlossen');
  } catch (error) {
    console.error('❌ Fehler bei Blacklist-Migration:', error.message);
  }
}

async function updateCategoryQuestionCounts() {
  console.log('📊 Aktualisiere Fragen-Anzahl pro Kategorie...');
  
  try {
    const categories = await Category.find();
    
    for (const category of categories) {
      const questionCount = await Question.countDocuments({ 
        category: category.categoryId,
        isActive: true
      });
      
      await Category.updateOne(
        { _id: category._id },
        { questionCount }
      );
      
      console.log(`✅ ${category.name}: ${questionCount} Fragen`);
    }
    
    console.log('✅ Kategorien-Statistiken aktualisiert');
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der Statistiken:', error.message);
  }
}

async function runMigration() {
  console.log('🚀 Starte MongoDB-Migration...');
  
  try {
    await migrateCategories();
    await migrateQuestions();
    await migrateBlacklist();
    await updateCategoryQuestionCounts();
    
    console.log('🎉 Migration erfolgreich abgeschlossen!');
  } catch (error) {
    console.error('❌ Migration fehlgeschlagen:', error.message);
  }
}

module.exports = { runMigration }; 