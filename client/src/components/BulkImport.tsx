import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { quizApi } from '../services/api';

const BulkImport: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('einfach');
  const [bulkData, setBulkData] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<Array<{question: string, answer: string}>>([]);
  const [showPreview, setShowPreview] = useState(false);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await quizApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError('Fehler beim Laden der Kategorien');
      console.error(err);
    }
  };

  const parseBulkData = () => {
    if (!bulkData.trim()) {
      alert('Bitte gib Daten ein!');
      return;
    }

    const lines = bulkData.trim().split('\n');
    const questions: Array<{question: string, answer: string}> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try different separators
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else {
        // Try to split by first occurrence of common patterns
        const match = line.match(/^(.+?)\s*[-–—]\s*(.+)$/);
        if (match) {
          parts = [match[1].trim(), match[2].trim()];
        } else {
          // If no separator found, skip this line
          continue;
        }
      }

      if (parts.length >= 2) {
        const question = parts[0].trim();
        const answer = parts[1].trim();
        
        if (question && answer) {
          questions.push({ question, answer });
        }
      }
    }

    if (questions.length === 0) {
      alert('Keine gültigen Frage-Antwort-Paare gefunden! Bitte überprüfe das Format.');
      return;
    }

    setPreviewQuestions(questions);
    setShowPreview(true);
  };

  const importQuestions = async () => {
    if (!selectedCategory) {
      alert('Bitte wähle eine Kategorie aus!');
      return;
    }

    if (previewQuestions.length === 0) {
      alert('Keine Fragen zum Importieren vorhanden!');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const questionData of previewQuestions) {
        try {
          await quizApi.addQuestion({
            category: selectedCategory,
            difficulty: selectedDifficulty,
            question: questionData.question,
            correctAnswer: questionData.answer,
            options: [questionData.answer]
          });
          successCount++;
        } catch (error) {
          console.error('Fehler beim Hinzufügen der Frage:', error);
          errorCount++;
        }
      }

      alert(`Import abgeschlossen!\n✅ ${successCount} Fragen erfolgreich hinzugefügt\n❌ ${errorCount} Fehler`);
      
      // Reset form
      setBulkData('');
      setPreviewQuestions([]);
      setShowPreview(false);
      setSelectedCategory('');
      setSelectedDifficulty('einfach');
      
    } catch (error) {
      console.error('Fehler beim Import:', error);
      alert('Fehler beim Import der Fragen');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📥 Bulk-Import</h1>
        <p>Importiere viele Fragen auf einmal aus Excel/CSV-Daten</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Fragen-Massenupload</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin')}
          >
            ← Zurück zum Admin
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>📋 Format-Anleitung</h3>
          <div style={{ 
            background: 'rgba(116, 185, 255, 0.1)', 
            border: '1px solid #74b9ff',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p><strong>Unterstützte Formate:</strong></p>
            <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>Tab-separiert:</strong> Frage[TAB]Antwort</li>
              <li><strong>Semikolon-separiert:</strong> Frage;Antwort</li>
              <li><strong>Komma-separiert:</strong> Frage,Antwort</li>
              <li><strong>Mit Bindestrich:</strong> Frage - Antwort</li>
            </ul>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
              <strong>Beispiel:</strong><br/>
              Was ist die Hauptstadt von Deutschland?	Berlin<br/>
              Wie viele Planeten hat unser Sonnensystem?	8
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            📁 Datei hochladen (optional)
          </label>
          <input
            type="file"
            accept=".txt,.csv,.tsv"
            onChange={handleFileUpload}
            style={{ marginBottom: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            📝 Daten einfügen
          </label>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              minHeight: '200px',
              fontFamily: 'monospace'
            }}
            placeholder="Füge hier deine Frage-Antwort-Paare ein...
Beispiel:
Was ist die Hauptstadt von Deutschland?	Berlin
Wie viele Planeten hat unser Sonnensystem?	8
Welches chemische Element hat die Ordnungszahl 79?	Gold"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Kategorie *
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          >
            <option value="">Kategorie auswählen...</option>
            {categories.map(category => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Schwierigkeitsgrad *
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            required
          >
            <option value="einfach">Einfach</option>
            <option value="mittel">Mittel</option>
            <option value="schwer">Schwer</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            className="btn"
            onClick={parseBulkData}
            disabled={!bulkData.trim()}
          >
            🔍 Vorschau generieren
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && previewQuestions.length > 0 && (
        <div className="card">
          <h3>👀 Vorschau ({previewQuestions.length} Fragen)</h3>
          <div style={{ 
            background: 'rgba(0, 184, 148, 0.1)', 
            border: '1px solid #00b894',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p><strong>Kategorie:</strong> {categories.find(c => c.categoryId === selectedCategory)?.name}</p>
            <p><strong>Schwierigkeit:</strong> {selectedDifficulty}</p>
            <p><strong>Anzahl Fragen:</strong> {previewQuestions.length}</p>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {previewQuestions.slice(0, 10).map((q, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '10px', 
                marginBottom: '10px',
                background: 'white'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {index + 1}. {q.question}
                </div>
                <div style={{ color: '#00b894', fontSize: '0.9rem' }}>
                  Antwort: {q.answer}
                </div>
              </div>
            ))}
            {previewQuestions.length > 10 && (
              <div style={{ textAlign: 'center', padding: '10px', opacity: 0.7 }}>
                ... und {previewQuestions.length - 10} weitere Fragen
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              className="btn btn-warning"
              onClick={() => setShowPreview(false)}
            >
              ❌ Abbrechen
            </button>
            <button 
              className="btn"
              onClick={importQuestions}
              disabled={loading || !selectedCategory}
            >
              {loading ? '⏳ Importiere...' : '✅ Fragen importieren'}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3>ℹ️ Tipps für den Import</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li>Kopiere deine Excel-Daten direkt in das Textfeld</li>
          <li>Stelle sicher, dass Frage und Antwort durch Tab, Semikolon oder Komma getrennt sind</li>
          <li>Leere Zeilen werden automatisch übersprungen</li>
          <li>Generiere immer zuerst eine Vorschau, um das Format zu überprüfen</li>
          <li>Du kannst mehrere Importe mit verschiedenen Kategorien/Schwierigkeiten machen</li>
          <li>Bei Fehlern werden nur die fehlerhaften Fragen übersprungen</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkImport; 