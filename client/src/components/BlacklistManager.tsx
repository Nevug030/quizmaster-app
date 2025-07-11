import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlacklistEntry } from '../types';
import { quizApi } from '../services/api';

const BlacklistManager: React.FC = () => {
  const navigate = useNavigate();
  const [blacklistedQuestions, setBlacklistedQuestions] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlacklistedQuestions();
  }, []);

  const loadBlacklistedQuestions = async () => {
    try {
      setLoading(true);
      const blacklist = await quizApi.getBlacklist();
      setBlacklistedQuestions(blacklist);
    } catch (err) {
      setError('Fehler beim Laden der Blacklist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromBlacklist = async (questionId: string) => {
    try {
      await quizApi.removeFromBlacklist(questionId);
      setBlacklistedQuestions(prev => 
        prev.filter(q => q.questionId !== questionId)
      );
      alert('Frage wurde von der Blacklist entfernt!');
    } catch (error) {
      console.error('Fehler beim Entfernen von der Blacklist:', error);
      alert('Fehler beim Entfernen von der Blacklist');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Lade Blacklist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={loadBlacklistedQuestions}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🚫 Blacklist-Verwaltung</h1>
        <p>Verwaltung der gesperrten Fragen</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Gesperrte Fragen ({blacklistedQuestions.length})</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            ← Zurück
          </button>
        </div>

        {blacklistedQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
            <h3>Keine gesperrten Fragen</h3>
            <p>Die Blacklist ist leer. Alle Fragen sind verfügbar.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {blacklistedQuestions.map((blacklistEntry, index) => (
              <div 
                key={blacklistEntry._id} 
                className="card"
                style={{ 
                  background: 'rgba(231, 112, 85, 0.1)',
                  border: '2px solid #e17055'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      marginBottom: '10px',
                      fontSize: '0.9rem',
                      opacity: 0.8
                    }}>
                      <span style={{ 
                        background: '#e17055', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {blacklistEntry.category}
                      </span>
                      <span style={{ 
                        background: '#fdcb6e', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {blacklistEntry.difficulty}
                      </span>
                    </div>
                    <h4 style={{ marginBottom: '10px' }}>{blacklistEntry.questionText}</h4>
                    <div style={{ 
                      background: 'rgba(0, 184, 148, 0.2)',
                      border: '1px solid #00b894',
                      borderRadius: '8px',
                      padding: '10px',
                      marginTop: '10px'
                    }}>
                      <strong style={{ color: '#00b894' }}>Antwort:</strong> {blacklistEntry.correctAnswer}
                    </div>
                    {blacklistEntry.reason && (
                      <div style={{ 
                        background: 'rgba(255, 107, 107, 0.2)',
                        border: '1px solid #ff6b6b',
                        borderRadius: '8px',
                        padding: '10px',
                        marginTop: '10px'
                      }}>
                        <strong style={{ color: '#ff6b6b' }}>Grund:</strong> {blacklistEntry.reason}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '0.8rem', 
                      opacity: 0.6, 
                      marginTop: '10px' 
                    }}>
                      Gesperrt am: {new Date(blacklistEntry.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <button 
                    className="btn btn-success"
                    onClick={() => removeFromBlacklist(blacklistEntry.questionId)}
                    style={{ marginLeft: '15px', padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    ✅ Entfernen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>ℹ️ Informationen</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li>Gesperrte Fragen werden nicht mehr in Quiz-Runden angezeigt</li>
          <li>Du kannst Fragen jederzeit wieder von der Blacklist entfernen</li>
          <li>Die Blacklist wird permanent in der Datenbank gespeichert</li>
          <li>Fragen können während des Spiels über den "🚫 Blacklist"-Button gesperrt werden</li>
          <li>Jeder Blacklist-Eintrag enthält den Grund und Zeitstempel</li>
        </ul>
      </div>
    </div>
  );
};

export default BlacklistManager; 