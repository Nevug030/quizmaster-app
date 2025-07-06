export interface Category {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  difficulties: string[];
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  questionId: string;
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  options: string[];
  usageCount: number;
  lastUsed: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

// Neue MongoDB-basierte Typen
export interface BlacklistEntry {
  _id: string;
  questionId: string;
  reason: string;
  category: string;
  difficulty: string;
  questionText: string;
  correctAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface MongoDBQuestion {
  _id: string;
  questionId: string;
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  options: string[];
  usageCount: number;
  lastUsed: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MongoDBCategory {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  difficulties: string[];
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 