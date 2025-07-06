import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Question } from '../types';
import { quizApi } from '../services/api';

const QuestionManager: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, questionsData] = await Promise.all([
        quizApi.getCategories(),
        quizApi.getQuestions()
      ]);
      setCategories(categoriesData);
      setQuestions(questionsData);
    } catch (err) {
      setError('Fehler beim Laden der Daten');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      // Add to blacklist instead of deleting (safer approach)
      await quizApi.addToBlacklist(questionId, 'Gelöscht über Admin-Panel');
      
      // Remove from local state
      setQuestions(prev => prev.filter(q => q.questionId !== questionId));
      
      alert('Frage wurde erfolgreich gelöscht!');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Fehler beim Löschen der Frage:', error);
      alert('Fehler beim Löschen der Frage');
    }
  };

  const bulkDeleteQuestions = async (questionIds: string[]) => {
    if (questionIds.length === 0) {
      alert('Keine Fragen zum Löschen ausgewählt!');
      return;
    }

    const confirmed = window.confirm(`Möchtest du wirklich ${questionIds.length} Fragen löschen?`);
    if (!confirmed) return;

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const questionId of questionIds) {
        try {
          await quizApi.addToBlacklist(questionId, 'Bulk-Löschung über Admin-Panel');
          successCount++;
        } catch (error) {
          console.error('Fehler beim Löschen der Frage:', error);
          errorCount++;
        }
      }

      // Reload questions to update the list
      const updatedQuestions = await quizApi.getQuestions();
      setQuestions(updatedQuestions);

      alert(`Bulk-Löschung abgeschlossen!\n✅ ${successCount} Fragen gelöscht\n❌ ${errorCount} Fehler`);
    } catch (error) {
      console.error('Fehler bei der Bulk-Löschung:', error);
      alert('Fehler bei der Bulk-Löschung');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on selected filters
  const filteredQuestions = questions.filter(question => {
    const matchesCategory = !selectedCategory || question.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || question.difficulty === selectedDifficulty;
    const matchesSearch = !searchTerm || 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.name || categoryId;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'einfach': return '#00b894';
      case 'mittel': return '#fdcb6e';
      case 'schwer': return '#e17055';
      default: return '#74b9ff';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Lade Fragen-Übersicht...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={loadData}>Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📋 Fragen-Verwaltung</h1>
        <p>Übersicht, Filterung und Verwaltung aller Fragen</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Fragen-Übersicht ({filteredQuestions.length} von {questions.length})</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin')}
          >
            ← Zurück zum Admin
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🔍 Suche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Frage oder Antwort suchen..."
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📚 Kategorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Alle Kategorien</option>
              {categories.map(category => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name} ({category.questionCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🎯 Schwierigkeit
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Alle Schwierigkeiten</option>
              <option value="einfach">Einfach</option>
              <option value="mittel">Mittel</option>
              <option value="schwer">Schwer</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: 'rgba(116, 185, 255, 0.1)', 
            border: '1px solid #74b9ff',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#74b9ff' }}>
              {questions.length}
            </div>
            <div style={{ fontSize: '0.9rem' }}>Gesamt</div>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 184, 148, 0.1)', 
            border: '1px solid #00b894',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00b894' }}>
              {questions.filter(q => q.difficulty === 'einfach').length}
            </div>
            <div style={{ fontSize: '0.9rem' }}>Einfach</div>
          </div>
          
          <div style={{ 
            background: 'rgba(253, 203, 110, 0.1)', 
            border: '1px solid #fdcb6e',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fdcb6e' }}>
              {questions.filter(q => q.difficulty === 'mittel').length}
            </div>
            <div style={{ fontSize: '0.9rem' }}>Mittel</div>
          </div>
          
          <div style={{ 
            background: 'rgba(225, 112, 85, 0.1)', 
            border: '1px solid #e17055',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e17055' }}>
              {questions.filter(q => q.difficulty === 'schwer').length}
            </div>
            <div style={{ fontSize: '0.9rem' }}>Schwer</div>
          </div>
        </div>

        {/* Questions List */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
              <h3>Keine Fragen gefunden</h3>
              <p>Versuche andere Filter-Einstellungen</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {filteredQuestions.map((question, index) => (
                <div key={question.questionId} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        marginBottom: '10px',
                        fontSize: '0.9rem'
                      }}>
                        <span style={{ 
                          background: '#74b9ff', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          textTransform: 'capitalize'
                        }}>
                          {getCategoryName(question.category)}
                        </span>
                        <span style={{ 
                          background: getDifficultyColor(question.difficulty), 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          textTransform: 'capitalize'
                        }}>
                          {question.difficulty}
                        </span>
                        <span style={{ 
                          background: '#6c5ce7', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          {question.questionId}
                        </span>
                      </div>
                      
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>
                        {index + 1}. {question.question}
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(0, 184, 148, 0.2)',
                        border: '1px solid #00b894',
                        borderRadius: '8px',
                        padding: '10px',
                        marginTop: '10px'
                      }}>
                        <strong style={{ color: '#00b894' }}>Antwort:</strong> {question.correctAnswer}
                      </div>
                    </div>
                    
                    <div style={{ marginLeft: '15px' }}>
                      {showDeleteConfirm === question.questionId ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-danger"
                            onClick={() => deleteQuestion(question.questionId)}
                            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                          >
                            ✅
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteConfirm(null)}
                            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-danger"
                          onClick={() => setShowDeleteConfirm(question.questionId)}
                          style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {filteredQuestions.length > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              className="btn btn-danger"
              onClick={() => {
                const questionIds = filteredQuestions.map(q => q.questionId);
                bulkDeleteQuestions(questionIds);
              }}
              disabled={loading}
            >
              {loading ? '⏳ Verarbeite...' : `🗑️ Alle gefilterten Fragen löschen (${filteredQuestions.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>ℹ️ Verwaltungs-Features</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li><strong>Filterung:</strong> Nach Kategorie, Schwierigkeit und Text suchen</li>
          <li><strong>Statistiken:</strong> Übersicht über Fragenanzahl nach Schwierigkeit</li>
          <li><strong>Einzellöschung:</strong> Klicke auf 🗑️ um eine Frage zu löschen</li>
          <li><strong>Bulk-Löschung:</strong> Alle gefilterten Fragen auf einmal löschen</li>
          <li><strong>Sichere Löschung:</strong> Fragen werden zur Blacklist hinzugefügt statt gelöscht</li>
          <li><strong>Live-Updates:</strong> Änderungen werden sofort angezeigt</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionManager; 