const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Datenpfade
const DATA_DIR = path.join(__dirname, 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');

// Hilfsfunktionen
async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadCategories() {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Standard-Kategorien erstellen
    const defaultCategories = [
      {
        id: 'allgemeinwissen',
        name: 'Allgemeinwissen',
        description: 'Allgemeine Fragen zu verschiedenen Themen',
        difficulties: ['einfach', 'mittel', 'schwer']
      },
      {
        id: 'geografie',
        name: 'Geografie',
        description: 'Fragen zu Ländern, Städten und geografischen Besonderheiten',
        difficulties: ['einfach', 'mittel', 'schwer']
      }
    ];
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
    return defaultCategories;
  }
}

async function loadBlacklist() {
  try {
    const data = await fs.readFile(BLACKLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Leere Blacklist erstellen
    const defaultBlacklist = [];
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(defaultBlacklist, null, 2));
    return defaultBlacklist;
  }
}

async function loadQuestions() {
  try {
    const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Standard-Fragen erstellen
    const defaultQuestions = [
      // Allgemeinwissen - Einfach
      {
        id: 'ae1',
        category: 'allgemeinwissen',
        difficulty: 'einfach',
        question: 'Was ist die Hauptstadt von Deutschland?',
        correctAnswer: 'Berlin',
        options: ['München', 'Berlin', 'Hamburg', 'Köln']
      },
      {
        id: 'ae2',
        category: 'allgemeinwissen',
        difficulty: 'einfach',
        question: 'Wie viele Planeten hat unser Sonnensystem?',
        correctAnswer: '8',
        options: ['7', '8', '9', '10']
      },
      // Allgemeinwissen - Mittel
      {
        id: 'am1',
        category: 'allgemeinwissen',
        difficulty: 'mittel',
        question: 'In welchem Jahr wurde die Berliner Mauer gebaut?',
        correctAnswer: '1961',
        options: ['1959', '1960', '1961', '1962']
      },
      {
        id: 'am2',
        category: 'allgemeinwissen',
        difficulty: 'mittel',
        question: 'Wer schrieb "Faust"?',
        correctAnswer: 'Goethe',
        options: ['Schiller', 'Goethe', 'Lessing', 'Kleist']
      },
      // Allgemeinwissen - Schwer
      {
        id: 'as1',
        category: 'allgemeinwissen',
        difficulty: 'schwer',
        question: 'Welches chemische Element hat die Ordnungszahl 79?',
        correctAnswer: 'Gold',
        options: ['Silber', 'Platin', 'Gold', 'Kupfer']
      },
      // Geografie - Einfach
      {
        id: 'ge1',
        category: 'geografie',
        difficulty: 'einfach',
        question: 'Welches ist das größte Land der Welt?',
        correctAnswer: 'Russland',
        options: ['China', 'USA', 'Russland', 'Kanada']
      },
      {
        id: 'ge2',
        category: 'geografie',
        difficulty: 'einfach',
        question: 'Welcher Fluss fließt durch Paris?',
        correctAnswer: 'Seine',
        options: ['Loire', 'Seine', 'Rhone', 'Garonne']
      },
      // Geografie - Mittel
      {
        id: 'gm1',
        category: 'geografie',
        difficulty: 'mittel',
        question: 'Welches ist die Hauptstadt von Australien?',
        correctAnswer: 'Canberra',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane']
      },
      {
        id: 'gm2',
        category: 'geografie',
        difficulty: 'mittel',
        question: 'Welcher Berg ist der höchste in Europa?',
        correctAnswer: 'Mont Blanc',
        options: ['Matterhorn', 'Mont Blanc', 'Mount Elbrus', 'Eiger']
      },
      // Geografie - Schwer
      {
        id: 'gs1',
        category: 'geografie',
        difficulty: 'schwer',
        question: 'Welches Land hat die meisten Zeitzonen?',
        correctAnswer: 'Frankreich',
        options: ['Russland', 'USA', 'Frankreich', 'Australien']
      }
    ];
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(defaultQuestions, null, 2));
    return defaultQuestions;
  }
}

// API Endpoints

// Alle Kategorien abrufen
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await loadCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Kategorien' });
  }
});

// Fragen nach Kategorie und Schwierigkeit abrufen
app.get('/api/questions', async (req, res) => {
  try {
    const { categories, difficulties } = req.query;
    const allQuestions = await loadQuestions();
    const blacklist = await loadBlacklist();
    
    let filteredQuestions = allQuestions;
    
    if (categories) {
      const categoryArray = categories.split(',');
      filteredQuestions = filteredQuestions.filter(q => 
        categoryArray.includes(q.category)
      );
    }
    
    if (difficulties) {
      const difficultyArray = difficulties.split(',');
      filteredQuestions = filteredQuestions.filter(q => 
        difficultyArray.includes(q.difficulty)
      );
    }
    
    // Blacklistierte Fragen ausschließen
    filteredQuestions = filteredQuestions.filter(q => 
      !blacklist.includes(q.id)
    );
    
    // Fragen mischen
    const shuffledQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
    
    res.json(shuffledQuestions);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Fragen' });
  }
});

// Neue Kategorie hinzufügen
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, difficulties } = req.body;
    const categories = await loadCategories();
    
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      difficulties: difficulties || ['einfach', 'mittel', 'schwer']
    };
    
    categories.push(newCategory);
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
    
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Kategorie' });
  }
});

// Neue Frage hinzufügen
app.post('/api/questions', async (req, res) => {
  try {
    const { category, difficulty, question, correctAnswer, options } = req.body;
    const questions = await loadQuestions();
    
    const newQuestion = {
      id: `${category.substring(0, 2)}${difficulty.substring(0, 1)}${Date.now()}`,
      category,
      difficulty,
      question,
      correctAnswer,
      options
    };
    
    questions.push(newQuestion);
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
    
    res.json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Frage' });
  }
});

// Blacklist abrufen
app.get('/api/blacklist', async (req, res) => {
  try {
    const blacklist = await loadBlacklist();
    res.json(blacklist);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Blacklist' });
  }
});

// Frage zur Blacklist hinzufügen
app.post('/api/blacklist', async (req, res) => {
  try {
    const { questionId } = req.body;
    const blacklist = await loadBlacklist();
    
    if (!blacklist.includes(questionId)) {
      blacklist.push(questionId);
      await fs.writeFile(BLACKLIST_FILE, JSON.stringify(blacklist, null, 2));
    }
    
    res.json({ success: true, blacklist });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Hinzufügen zur Blacklist' });
  }
});

// Frage von Blacklist entfernen
app.delete('/api/blacklist/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const blacklist = await loadBlacklist();
    
    const updatedBlacklist = blacklist.filter(id => id !== questionId);
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(updatedBlacklist, null, 2));
    
    res.json({ success: true, blacklist: updatedBlacklist });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Entfernen von der Blacklist' });
  }
});

// Alle anderen Anfragen an React-App weiterleiten
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Server starten
async function startServer() {
  await ensureDataDirectory();
  await loadCategories();
  await loadQuestions();
  await loadBlacklist();
  
  app.listen(PORT, () => {
    console.log(`🚀 Quizmaster-Server läuft auf Port ${PORT}`);
    console.log(`📊 API verfügbar unter http://localhost:${PORT}/api`);
  });
}

startServer(); 