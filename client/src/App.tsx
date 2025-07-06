import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import QuizSetup from './components/QuizSetup';
import GamePage from './components/GamePage';
import BlacklistManager from './components/BlacklistManager';
import AdminPanel from './components/AdminPanel';
import BulkImport from './components/BulkImport';
import QuestionManager from './components/QuestionManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
              <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<QuizSetup />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/blacklist" element={<BlacklistManager />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/bulk-import" element={<BulkImport />} />
        <Route path="/questions" element={<QuestionManager />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App; 