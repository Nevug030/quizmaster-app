import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, QuizSettings, GameState } from '../types';
import { quizApi } from '../services/api';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    questions: [],
    availableQuestions: [],
    players: [],
    gameStarted: false,
    gameEnded: false,
    currentQuestion: null,
    showAnswer: false,
    selectedPlayer: null,
    blacklistedQuestions: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(1); // Start bei 1, da die erste Frage geladen ist

  const initializeGame = useCallback(async () => {
    try {
      setLoading(true);
      
      // Settings aus localStorage laden
      const savedSettings = localStorage.getItem('quizSettings');
      if (!savedSettings) {
        navigate('/setup');
        return;
      }
      
      const quizSettings: QuizSettings = JSON.parse(savedSettings);
      setSettings(quizSettings);
      
      // Fragen laden
      const questions = await quizApi.getQuestions(
        quizSettings.selectedCategories,
        quizSettings.selectedDifficulties
      );
      
      if (questions.length === 0) {
        setError('Keine Fragen für die ausgewählten Kategorien und Schwierigkeitsgrade gefunden!');
        return;
      }
      
      // Fragen mischen und auf die gewünschte Anzahl begrenzen
      const shuffledQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, quizSettings.questionCount);
      
      setGameState(prev => ({
        ...prev,
        questions: shuffledQuestions,
        availableQuestions: questions, // Alle verfügbaren Fragen für Nachladung
        players: quizSettings.players,
        currentQuestion: shuffledQuestions[0],
        gameStarted: true
      }));
      
    } catch (err) {
      setError('Fehler beim Laden der Fragen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);



  const selectPlayer = (player: Player) => {
    if (gameState.showAnswer) return;
    
    setGameState(prev => ({
      ...prev,
      selectedPlayer: player
    }));
  };

  const awardPoint = () => {
    if (!gameState.selectedPlayer || !gameState.currentQuestion) return;
    
    const updatedPlayers = gameState.players.map(player => 
      player.id === gameState.selectedPlayer!.id 
        ? { ...player, score: player.score + 1 }
        : player
    );
    
    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      showAnswer: true
    }));
  };

  const nextQuestion = () => {
    // Zähle, wie viele Fragen tatsächlich gestellt wurden
    if (!settings) return;
    const nextAsked = questionsAsked + 1;
    if (nextAsked > settings.questionCount) {
      // Spiel beenden, wenn die gewünschte Anzahl erreicht ist
      setGameState(prev => ({
        ...prev,
        gameEnded: true,
        showAnswer: false,
        selectedPlayer: null
      }));
      return;
    }
    const nextIndex = gameState.currentQuestionIndex + 1;
    setQuestionsAsked(nextAsked);
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      currentQuestion: prev.questions[nextIndex],
      showAnswer: false,
      selectedPlayer: null
    }));
  };

  const skipQuestion = () => {
    // Neue Frage aus den verfügbaren Fragen holen
    const usedQuestionIds = gameState.questions.map(q => q.questionId);
    const availableQuestions = gameState.availableQuestions.filter(q => 
      !usedQuestionIds.includes(q.questionId)
    );
    if (availableQuestions.length > 0) {
      // Zufällige neue Frage auswählen
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const newQuestion = availableQuestions[randomIndex];
      // Ersetze die aktuelle Frage durch die neue (statt anhängen)
      const updatedQuestions = [...gameState.questions];
      updatedQuestions[gameState.currentQuestionIndex] = newQuestion;
      setGameState(prev => ({
        ...prev,
        questions: updatedQuestions,
        currentQuestion: newQuestion,
        showAnswer: false,
        selectedPlayer: null
      }));
      // Fragenzähler bleibt gleich, da nur ersetzt wurde
    } else {
      // Keine weiteren Fragen verfügbar, normale nächste Frage
      nextQuestion();
    }
  };

  const blacklistQuestion = async () => {
    if (!gameState.currentQuestion) return;
    
    try {
      await quizApi.addToBlacklist(gameState.currentQuestion.questionId);
      setGameState(prev => ({
        ...prev,
        blacklistedQuestions: [...prev.blacklistedQuestions, gameState.currentQuestion!.questionId]
      }));
      alert(`Frage "${gameState.currentQuestion.question.substring(0, 50)}..." wurde zur Blacklist hinzugefügt!`);
      
      // Nach dem Blacklisten auch eine neue Frage nachladen
      skipQuestion();
    } catch (error) {
      console.error('Fehler beim Hinzufügen zur Blacklist:', error);
      alert('Fehler beim Hinzufügen zur Blacklist');
    }
  };

  const restartGame = () => {
    navigate('/setup');
  };

  const getWinner = () => {
    if (gameState.players.length === 0) return null;
    return gameState.players.reduce((winner, player) => 
      player.score > winner.score ? player : winner
    );
  };

  const getSortedPlayers = () => {
    return [...gameState.players].sort((a, b) => b.score - a.score);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Lade Quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={() => navigate('/setup')}>
          Zurück zum Setup
        </button>
      </div>
    );
  }

  if (gameState.gameEnded) {
    const winner = getWinner();
    const sortedPlayers = getSortedPlayers();
    
    return (
      <div className="container">
        <div className="header">
          <h1>🏆 Quiz beendet!</h1>
          <p>Hier ist das finale Ergebnis</p>
        </div>

        <div className="scoreboard">
          <h3>🏅 Finales Leaderboard</h3>
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`player-score ${player.id === winner?.id ? 'winner' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: player.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{player.name}</strong>
                  {player.id === winner?.id && (
                    <div style={{ fontSize: '0.9rem', color: '#fdcb6e' }}>
                      🏆 Gewinner!
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {player.score} {player.score === 1 ? 'Punkt' : 'Punkte'}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={restartGame}>
              🎮 Neues Quiz
            </button>
            <button className="btn" onClick={() => navigate('/')}>
              🏠 Zurück zum Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState.currentQuestion) {
    return (
      <div className="container">
        <div className="error">Keine Fragen verfügbar</div>
        <button className="btn" onClick={() => navigate('/setup')}>
          Zurück zum Setup
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Quiz läuft</h1>
        <p>
          Frage {questionsAsked} von {settings?.questionCount}
        </p>
      </div>

      {/* Fortschrittsbalken */}
      <div className="card">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${settings?.questionCount ? ((questionsAsked) / settings.questionCount) * 100 : 0}%` 
            }}
          />
        </div>
        {settings && gameState.questions.length > settings.questionCount && (
          <div style={{ 
            background: 'rgba(116, 185, 255, 0.2)', 
            border: '1px solid #74b9ff',
            borderRadius: '8px',
            padding: '10px',
            marginTop: '10px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ℹ️ Fragen werden automatisch nachgeladen, um die Gesamtanzahl konstant zu halten
          </div>
        )}
      </div>

      {/* Aktuelle Frage */}
      <div className="question-card">
        <div className="question-text">
          {gameState.currentQuestion.question}
        </div>
        
        {/* Quizmaster sieht die Antwort direkt */}
        <div className="answer-display">
          <h4>✅ Richtige Antwort:</h4>
          <div className="answer-text">
            {gameState.currentQuestion.correctAnswer}
          </div>
        </div>
      </div>

      {/* Spieler-Auswahl */}
      <div className="card">
        <h3>👥 Spieler auswählen</h3>
        <div className="player-list">
          {gameState.players.map(player => (
            <div 
              key={player.id} 
              className="player-card"
              style={{ 
                border: gameState.selectedPlayer?.id === player.id ? '3px solid #74b9ff' : 'none',
                transform: gameState.selectedPlayer?.id === player.id ? 'scale(1.05)' : 'none'
              }}
              onClick={() => selectPlayer(player)}
            >
              <div 
                className="player-avatar"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <h4>{player.name}</h4>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {player.score} {player.score === 1 ? 'Punkt' : 'Punkte'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spiel-Controls */}
      <div className="game-controls">
        {!gameState.showAnswer ? (
          <>
            <button 
              className="btn btn-warning"
              onClick={skipQuestion}
              title="Frage überspringen und neue Frage nachladen"
            >
              ⏭️ Überspringen & Nachladen
            </button>
            <button 
              className="btn btn-danger"
              onClick={blacklistQuestion}
              title="Frage zur Blacklist hinzufügen und neue Frage nachladen"
            >
              🚫 Blacklist & Nachladen
            </button>
            <button 
              className="btn btn-success"
              onClick={awardPoint}
              disabled={!gameState.selectedPlayer}
            >
              ✅ Punkt vergeben
            </button>
          </>
        ) : (
          <button 
            className="btn btn-secondary"
            onClick={nextQuestion}
          >
            {settings?.questionCount && questionsAsked >= settings.questionCount ? '�� Quiz beenden' : '⏭️ Nächste Frage'}
          </button>
        )}
      </div>

      {/* Aktuelles Leaderboard */}
      <div className="scoreboard">
        <h3>📊 Aktuelle Punktzahl</h3>
        {getSortedPlayers().map(player => (
          <div key={player.id} className="player-score">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                backgroundColor: player.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span>{player.name}</span>
            </div>
            <span style={{ fontWeight: 'bold' }}>
              {player.score} {player.score === 1 ? 'Punkt' : 'Punkte'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePage; 