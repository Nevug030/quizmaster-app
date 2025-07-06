import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Question } from '../types';
import { quizApi } from '../services/api';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  
  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryDifficulties, setCategoryDifficulties] = useState<string[]>(['einfach', 'mittel', 'schwer']);
  
  // Question form
  const [questionCategory, setQuestionCategory] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('einfach');
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await quizApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError('Fehler beim Laden der Kategorien');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      alert('Bitte gib einen Kategorienamen ein!');
      return;
    }
    
    try {
      const newCategory = await quizApi.addCategory({
        name: categoryName,
        description: categoryDescription,
        difficulties: categoryDifficulties
      });
      
      setCategories([...categories, newCategory]);
      setCategoryName('');
      setCategoryDescription('');
      setCategoryDifficulties(['einfach', 'mittel', 'schwer']);
      setShowCategoryForm(false);
      
      alert('Kategorie erfolgreich hinzugefügt!');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      alert('Fehler beim Hinzufügen der Kategorie');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim() || !correctAnswer.trim()) {
      alert('Bitte fülle alle Pflichtfelder aus!');
      return;
    }
    
    try {
      const newQuestion = await quizApi.addQuestion({
        category: questionCategory,
        difficulty: questionDifficulty,
        question: questionText,
        correctAnswer,
        options: [correctAnswer] // Nur die richtige Antwort als Option
      });
      
      // Reset form
      setQuestionCategory('');
      setQuestionDifficulty('einfach');
      setQuestionText('');
      setCorrectAnswer('');
      setShowQuestionForm(false);
      
      alert('Frage erfolgreich hinzugefügt!');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Frage:', error);
      alert('Fehler beim Hinzufügen der Frage');
    }
  };

  const toggleDifficulty = (difficulty: string) => {
    setCategoryDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Lade Admin-Panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={loadCategories}>Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>⚙️ Admin-Panel</h1>
        <p>Verwaltung von Kategorien und Fragen</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Verfügbare Kategorien ({categories.length})</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            ← Zurück
          </button>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {categories.map(category => (
            <div key={category.categoryId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{category.name}</h3>
                  <p style={{ opacity: 0.8, marginBottom: '10px' }}>{category.description}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {category.difficulties.map(difficulty => (
                      <span 
                        key={difficulty}
                        style={{ 
                          background: '#74b9ff', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          textTransform: 'capitalize'
                        }}
                      >
                        {difficulty}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00b894' }}>
                    {category.questionCount} Fragen
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn"
            onClick={() => setShowCategoryForm(!showCategoryForm)}
          >
            {showCategoryForm ? '❌ Abbrechen' : '➕ Neue Kategorie'}
          </button>
          <button 
            className="btn"
            onClick={() => setShowQuestionForm(!showQuestionForm)}
          >
            {showQuestionForm ? '❌ Abbrechen' : '❓ Neue Frage'}
          </button>
          <button 
            className="btn"
            onClick={() => navigate('/bulk-import')}
          >
            📥 Bulk-Import
          </button>
        </div>
      </div>

      {/* Category Form */}
      {showCategoryForm && (
        <div className="card">
          <h3>➕ Neue Kategorie hinzufügen</h3>
          <form onSubmit={handleAddCategory}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Kategoriename *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="z.B. Geschichte, Wissenschaft, Sport..."
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Beschreibung
              </label>
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                placeholder="Beschreibung der Kategorie..."
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Schwierigkeitsgrade
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['einfach', 'mittel', 'schwer'].map(difficulty => (
                  <label key={difficulty} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="checkbox"
                      checked={categoryDifficulties.includes(difficulty)}
                      onChange={() => toggleDifficulty(difficulty)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{difficulty}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn">
              ✅ Kategorie hinzufügen
            </button>
          </form>
        </div>
      )}

      {/* Question Form */}
      {showQuestionForm && (
        <div className="card">
          <h3>❓ Neue Frage hinzufügen</h3>
          <form onSubmit={handleAddQuestion}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Kategorie *
              </label>
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Schwierigkeitsgrad *
              </label>
              <select
                value={questionDifficulty}
                onChange={(e) => setQuestionDifficulty(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                required
              >
                <option value="einfach">Einfach</option>
                <option value="mittel">Mittel</option>
                <option value="schwer">Schwer</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Frage *
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                placeholder="Deine Frage hier..."
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Richtige Antwort *
              </label>
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Richtige Antwort..."
                required
              />
            </div>



            <button type="submit" className="btn">
              ✅ Frage hinzufügen
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>ℹ️ Informationen</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li>Neue Kategorien werden sofort für Quiz-Runden verfügbar</li>
          <li>Fragen werden automatisch der entsprechenden Kategorie zugeordnet</li>
          <li>Nur die richtige Antwort wird angezeigt (keine Multiple Choice)</li>
          <li>Du kannst Fragen jederzeit über die Blacklist sperren</li>
          <li>Alle Änderungen werden permanent in der Datenbank gespeichert</li>
          <li>Die Fragenanzahl wird automatisch aktualisiert</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel; 