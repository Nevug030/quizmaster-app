export interface Category {
  id: string;
  name: string;
  description: string;
  difficulties: string[];
}

export interface Question {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface QuizSettings {
  selectedCategories: string[];
  selectedDifficulties: string[];
  mixedMode: boolean;
  players: Player[];
  questionCount: number;
}

export interface GameState {
  currentQuestionIndex: number;
  questions: Question[];
  availableQuestions: Question[];
  players: Player[];
  gameStarted: boolean;
  gameEnded: boolean;
  currentQuestion: Question | null;
  showAnswer: boolean;
  selectedPlayer: Player | null;
  blacklistedQuestions: string[];
} 