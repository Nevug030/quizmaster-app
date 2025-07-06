const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');

async function syncBlacklist() {
  console.log('🔄 Synchronisiere Blacklist...');
  
  try {
    // Standard-Blacklist mit bekannten Einträgen
    const standardBlacklist = ['ge2', 'as1', 'gm2', 'ae2'];
    
    // Prüfe ob Blacklist-Datei existiert
    let currentBlacklist = [];
    try {
      const data = await fs.readFile(BLACKLIST_FILE, 'utf8');
      currentBlacklist = JSON.parse(data);
      console.log(`📋 Aktuelle Blacklist: ${currentBlacklist.length} Einträge`);
    } catch (error) {
      console.log(`📝 Blacklist-Datei nicht gefunden, erstelle neue...`);
    }
    
    // Füge fehlende Standard-Einträge hinzu
    const missingEntries = standardBlacklist.filter(id => !currentBlacklist.includes(id));
    if (missingEntries.length > 0) {
      console.log(`➕ Füge fehlende Einträge hinzu: ${missingEntries.join(', ')}`);
      currentBlacklist = [...new Set([...currentBlacklist, ...standardBlacklist])];
    }
    
    // Entferne ungültige Einträge (die nicht in den Standard-Fragen existieren)
    const validQuestionIds = ['ae1', 'ae2', 'am1', 'am2', 'as1', 'ge1', 'ge2', 'gm1', 'gm2', 'gs1'];
    const invalidEntries = currentBlacklist.filter(id => !validQuestionIds.includes(id));
    if (invalidEntries.length > 0) {
      console.log(`🗑️ Entferne ungültige Einträge: ${invalidEntries.join(', ')}`);
      currentBlacklist = currentBlacklist.filter(id => validQuestionIds.includes(id));
    }
    
    // Speichere aktualisierte Blacklist
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(currentBlacklist, null, 2));
    console.log(`✅ Blacklist synchronisiert: ${currentBlacklist.length} Einträge`);
    console.log(`📋 Finale Blacklist:`, currentBlacklist);
    
  } catch (error) {
    console.error(`❌ Fehler beim Synchronisieren der Blacklist: ${error.message}`);
  }
}

syncBlacklist(); 