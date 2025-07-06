import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Player, QuizSettings } from '../types';
import { quizApi } from '../services/api';

const QuizSetup: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz-Einstellungen
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [mixedMode, setMixedMode] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Farben für Spieler
  const playerColors = [
    '#ff6b6b', '#74b9ff', '#00b894', '#fdcb6e', 
    '#e17055', '#6c5ce7', '#fd79a8', '#00cec9'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await quizApi.getCategories();
      setCategories(categoriesData);
      
      // Standardmäßig alle Kategorien und Schwierigkeiten auswählen
      setSelectedCategories(categoriesData.map(cat => cat.categoryId));
      setSelectedDifficulties(['einfach', 'mittel', 'schwer']);
    } catch (err) {
      setError('Fehler beim Laden der Kategorien');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        color: playerColors[players.length % playerColors.length]
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const startQuiz = () => {
    if (selectedCategories.length === 0) {
      alert('Bitte wähle mindestens eine Kategorie aus!');
      return;
    }
    if (selectedDifficulties.length === 0) {
      alert('Bitte wähle mindestens einen Schwierigkeitsgrad aus!');
      return;
    }
    if (players.length === 0) {
      alert('Bitte füge mindestens einen Spieler hinzu!');
      return;
    }

    const settings: QuizSettings = {
      selectedCategories,
      selectedDifficulties,
      mixedMode,
      questionCount,
      players
    };

    // Settings im localStorage speichern
    localStorage.setItem('quizSettings', JSON.stringify(settings));
    navigate('/game');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Lade Kategorien...</div>
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
        <h1>🎮 Quiz einrichten</h1>
        <p>Wähle Kategorien, Schwierigkeitsgrade und füge Spieler hinzu</p>
      </div>

      <div className="card">
        <h2>📚 Kategorien auswählen</h2>
        <div className="checkbox-group">
          {categories.map(category => (
            <div 
              key={category.categoryId}
              className={`checkbox-item ${selectedCategories.includes(category.categoryId) ? 'checked' : ''}`}
              onClick={() => handleCategoryToggle(category.categoryId)}
            >
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(category.categoryId)}
                onChange={() => {}} // Handled by onClick
              />
              <div>
                <strong>{category.name}</strong>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {category.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>🎯 Schwierigkeitsgrade</h2>
        <div className="checkbox-group">
          {['einfach', 'mittel', 'schwer'].map(difficulty => (
            <div 
              key={difficulty}
              className={`checkbox-item ${selectedDifficulties.includes(difficulty) ? 'checked' : ''}`}
              onClick={() => handleDifficultyToggle(difficulty)}
            >
              <input 
                type="checkbox" 
                checked={selectedDifficulties.includes(difficulty)}
                onChange={() => {}} // Handled by onClick
              />
              <span style={{ textTransform: 'capitalize' }}>{difficulty}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>🎲 Quiz-Modus</h2>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div 
            className={`checkbox-item ${mixedMode ? 'checked' : ''}`}
            onClick={() => setMixedMode(true)}
            style={{ flex: '1', minWidth: '200px' }}
          >
            <input 
              type="radio" 
              checked={mixedMode}
              onChange={() => {}} // Handled by onClick
            />
            <div>
              <strong>Gemischt</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Alle Fragen gemischt
              </div>
            </div>
          </div>
          
          <div 
            className={`checkbox-item ${!mixedMode ? 'checked' : ''}`}
            onClick={() => setMixedMode(false)}
            style={{ flex: '1', minWidth: '200px' }}
          >
            <input 
              type="radio" 
              checked={!mixedMode}
              onChange={() => {}} // Handled by onClick
            />
            <div>
              <strong>Kategorieweise</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Kategorien einzeln abarbeiten
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📊 Anzahl der Fragen</h2>
        <div className="input-group">
          <label>Wie viele Fragen soll das Quiz haben?</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '300px', margin: '0 auto' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}
              disabled={questionCount <= 5}
              style={{ padding: '8px 12px', fontSize: '14px' }}
            >
              -5
            </button>
            <input
              type="number"
              min="5"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 10)))}
              style={{ textAlign: 'center', flex: '1' }}
            />
            <button 
              className="btn btn-secondary"
              onClick={() => setQuestionCount(Math.min(50, questionCount + 5))}
              disabled={questionCount >= 50}
              style={{ padding: '8px 12px', fontSize: '14px' }}
            >
              +5
            </button>
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
            Mindestens 5, maximal 50 Fragen
          </div>
        </div>
      </div>

      <div className="card">
        <h2>👥 Spieler hinzufügen</h2>
        <div className="input-group">
          <div style={{ display: 'flex', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Spielername eingeben..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              style={{ flex: '1' }}
            />
            <button 
              className="btn btn-success" 
              onClick={addPlayer}
              disabled={!newPlayerName.trim() || players.length >= 8}
            >
              Hinzufügen
            </button>
          </div>
        </div>

        {players.length > 0 && (
          <div className="player-list">
            {players.map((player, index) => (
              <div key={player.id} className="player-card">
                <div 
                  className="player-avatar"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <h4>{player.name}</h4>
                <button 
                  className="btn btn-danger"
                  onClick={() => removePlayer(player.id)}
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}

        {players.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>
            Noch keine Spieler hinzugefügt
          </p>
        )}

        {players.length >= 8 && (
          <p style={{ textAlign: 'center', color: '#fdcb6e' }}>
            Maximum von 8 Spielern erreicht
          </p>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/')}
          >
            ← Zurück
          </button>
          <button 
            className="btn" 
            onClick={startQuiz}
            disabled={selectedCategories.length === 0 || selectedDifficulties.length === 0 || players.length === 0}
          >
            🎮 Quiz starten
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSetup; 