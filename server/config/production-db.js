const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Produktions-Datenbank-Konfiguration
const productionConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maximale Verbindungen
  serverSelectionTimeoutMS: 5000, // Timeout für Server-Auswahl
  socketTimeoutMS: 45000, // Socket Timeout
  bufferMaxEntries: 0, // Keine Buffer-Limits
  bufferCommands: false, // Keine Buffer-Kommandos
  // Retry-Logik für Produktion
  retryWrites: true,
  retryReads: true,
  // SSL/TLS für Sicherheit
  ssl: true,
  sslValidate: true,
  // Connection Pooling
  poolSize: 10,
  // Heartbeat für stabile Verbindung
  heartbeatFrequencyMS: 10000,
  // Timeout-Einstellungen
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

// Entwicklung-Konfiguration
const developmentConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 30000,
};

const connectDB = async () => {
  try {
    console.log('🔌 Verbinde mit MongoDB Atlas...');
    
    const config = process.env.NODE_ENV === 'production' 
      ? productionConfig 
      : developmentConfig;
    
    await mongoose.connect(MONGODB_URI, config);
    
    console.log('✅ MongoDB Atlas erfolgreich verbunden');
    console.log(`📊 Umgebung: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Datenbank: ${mongoose.connection.name}`);
    
    // Connection-Events für Produktion
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Verbindungsfehler:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Verbindung getrennt');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Verbindung wiederhergestellt');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error.message);
    console.error('🔧 Überprüfe deine MONGODB_URI Environment Variable');
    process.exit(1);
  }
};

// Graceful Shutdown für Produktion
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB Verbindung sauber geschlossen');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler beim Schließen der Verbindung:', error);
    process.exit(1);
  }
};

// Event Listener für sauberes Beenden
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = connectDB; 