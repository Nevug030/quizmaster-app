const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

async function debugBlacklist() {
  console.log('🔍 Debug: Blacklist-Funktionalität testen');
  console.log('==========================================');
  
  try {
    // Prüfe ob Blacklist-Datei existiert
    console.log(`📁 Blacklist-Datei: ${BLACKLIST_FILE}`);
    try {
      const blacklistData = await fs.readFile(BLACKLIST_FILE, 'utf8');
      const blacklist = JSON.parse(blacklistData);
      console.log(`✅ Blacklist gefunden: ${blacklist.length} Einträge`);
      console.log(`📋 Blacklist-Inhalt:`, blacklist);
    } catch (error) {
      console.log(`❌ Blacklist-Datei nicht gefunden: ${error.message}`);
    }
    
    // Prüfe Fragen-Datei
    console.log(`\n📁 Fragen-Datei: ${QUESTIONS_FILE}`);
    try {
      const questionsData = await fs.readFile(QUESTIONS_FILE, 'utf8');
      const questions = JSON.parse(questionsData);
      console.log(`✅ Fragen-Datei gefunden: ${questions.length} Fragen`);
      
      // Zeige alle Frage-IDs
      const questionIds = questions.map(q => q.id);
      console.log(`📋 Verfügbare Frage-IDs:`, questionIds);
      
      // Prüfe Blacklist-Einträge gegen verfügbare Fragen
      try {
        const blacklistData = await fs.readFile(BLACKLIST_FILE, 'utf8');
        const blacklist = JSON.parse(blacklistData);
        
        console.log(`\n🔍 Blacklist-Validierung:`);
        blacklist.forEach(id => {
          const question = questions.find(q => q.id === id);
          if (question) {
            console.log(`✅ ${id}: "${question.question.substring(0, 50)}..."`);
          } else {
            console.log(`❌ ${id}: Frage nicht gefunden!`);
          }
        });
      } catch (error) {
        console.log(`❌ Blacklist kann nicht gelesen werden: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Fragen-Datei nicht gefunden: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Debug-Fehler: ${error.message}`);
  }
}

debugBlacklist(); 