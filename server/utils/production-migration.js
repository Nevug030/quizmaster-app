const fs = require('fs').promises;
const path = require('path');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Blacklist = require('../models/Blacklist');

const DATA_DIR = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(__dirname, '../backups');

// Backup-Funktion für sichere Migration
async function createBackup() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    
    const backup = {
      timestamp: new Date().toISOString(),
      questions: await fs.readFile(path.join(DATA_DIR, 'questions.json'), 'utf8'),
      categories: await fs.readFile(path.join(DATA_DIR, 'categories.json'), 'utf8'),
      blacklist: await fs.readFile(path.join(DATA_DIR, 'blacklist.json'), 'utf8')
    };
    
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup erstellt: ${backupPath}`);
    
    return backupPath;
  } catch (error) {
    console.log('⚠️ Backup nicht möglich, fahre ohne Backup fort...');
    return null;
  }
}

// Rollback-Funktion
async function rollbackMigration(backupPath) {
  if (!backupPath) {
    console.log('❌ Kein Backup verfügbar für Rollback');
    return;
  }
  
  try {
    const backup = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    
    // Lösche alle MongoDB-Daten
    await Question.deleteMany({});
    await Category.deleteMany({});
    await Blacklist.deleteMany({});
    
    // Stelle JSON-Daten wieder her
    await fs.writeFile(path.join(DATA_DIR, 'questions.json'), backup.questions);
    await fs.writeFile(path.join(DATA_DIR, 'categories.json'), backup.categories);
    await fs.writeFile(path.join(DATA_DIR, 'blacklist.json'), backup.blacklist);
    
    console.log('✅ Rollback erfolgreich - JSON-Daten wiederhergestellt');
  } catch (error) {
    console.error('❌ Rollback fehlgeschlagen:', error.message);
  }
}

// Sichere Migration mit Backup
async function safeMigration() {
  console.log('🔄 Starte sichere Migration...');
  
  let backupPath = null;
  
  try {
    // 1. Backup erstellen
    backupPath = await createBackup();
    
    // 2. Migration durchführen
    const { runMigration } = require('./migration');
    await runMigration();
    
    console.log('✅ Migration erfolgreich abgeschlossen');
    
    // 3. Verifiziere Migration
    const questionCount = await Question.countDocuments();
    const categoryCount = await Category.countDocuments();
    const blacklistCount = await Blacklist.countDocuments();
    
    console.log(`📊 Migration-Statistiken:`);
    console.log(`   - Fragen: ${questionCount}`);
    console.log(`   - Kategorien: ${categoryCount}`);
    console.log(`   - Blacklist: ${blacklistCount}`);
    
    if (questionCount === 0) {
      throw new Error('Keine Fragen migriert - Migration fehlgeschlagen');
    }
    
    console.log('✅ Migration verifiziert - Backup kann gelöscht werden');
    
    // 4. Backup löschen (optional)
    if (backupPath) {
      await fs.unlink(backupPath);
      console.log('🗑️ Backup gelöscht');
    }
    
  } catch (error) {
    console.error('❌ Migration fehlgeschlagen:', error.message);
    
    // Rollback durchführen
    console.log('🔄 Starte Rollback...');
    await rollbackMigration(backupPath);
    
    throw error;
  }
}

// Produktions-Migration mit Sicherheitschecks
async function productionMigration() {
  console.log('🚀 Starte Produktions-Migration...');
  
  try {
    // Prüfe Datenbank-Verbindung
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Keine Datenbank-Verbindung');
    }
    
    // Prüfe ob bereits Daten existieren
    const existingQuestions = await Question.countDocuments();
    if (existingQuestions > 0) {
      console.log(`ℹ️ Bereits ${existingQuestions} Fragen in der Datenbank vorhanden`);
      console.log('ℹ️ Migration übersprungen - Datenbank bereits migriert');
      return;
    }
    
    // Sichere Migration durchführen
    await safeMigration();
    
    console.log('🎉 Produktions-Migration erfolgreich abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Produktions-Migration fehlgeschlagen:', error.message);
    process.exit(1);
  }
}

module.exports = { 
  productionMigration, 
  safeMigration, 
  createBackup, 
  rollbackMigration 
}; 