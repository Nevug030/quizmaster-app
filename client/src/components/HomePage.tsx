import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Quizmaster</h1>
        <p>Die ultimative Quiz-App für Quizmaster und Spieler</p>
      </div>

      <div className="card">
        <h2>Willkommen beim Quizmaster!</h2>
        <p>
          Erstelle spannende Quiz-Runden mit verschiedenen Kategorien und Schwierigkeitsgraden. 
          Füge Spieler hinzu, stelle Fragen und verfolge die Punktzahl in Echtzeit.
        </p>
        
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/setup')}
          >
            🎮 Quiz starten
          </button>
          <button 
            className="btn btn-warning" 
            onClick={() => navigate('/blacklist')}
          >
            🚫 Blacklist verwalten
          </button>
        </div>
      </div>

      <div className="card">
        <h3>✨ Features</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📚</div>
            <h4>Viele Kategorien</h4>
            <p>Allgemeinwissen, Geografie und mehr mit verschiedenen Schwierigkeitsgraden</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
            <h4>Mehrspieler-Modus</h4>
            <p>Füge beliebig viele Spieler hinzu und verfolge ihre Punktzahl</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎲</div>
            <h4>Zufällige Fragen</h4>
            <p>Jedes Quiz ist anders - Fragen werden zufällig gemischt</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏆</div>
            <h4>Leaderboard</h4>
            <p>Sieh am Ende, wer gewonnen hat und die Punktzahl aller Spieler</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🎯 So funktioniert's</h3>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8' }}>
          <li><strong>Quiz einrichten:</strong> Wähle Kategorien und Schwierigkeitsgrade aus</li>
          <li><strong>Spieler hinzufügen:</strong> Füge alle Teilnehmer mit Namen hinzu</li>
          <li><strong>Quiz-Modus wählen:</strong> Gemischt oder kategorieweise</li>
          <li><strong>Spielen:</strong> Klicke auf Spieler, die die Frage beantworten</li>
          <li><strong>Punkte vergeben:</strong> Richtige Antworten geben Punkte</li>
          <li><strong>Fragen überspringen:</strong> Nutze die Skip-Funktion bei Bedarf</li>
          <li><strong>Gewinner ermitteln:</strong> Sieh das finale Leaderboard</li>
        </ol>
      </div>
    </div>
  );
};

export default HomePage; 