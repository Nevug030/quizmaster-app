# 🎯 Quizmaster App

Eine moderne Quiz-App für Quizmaster und Spieler mit verschiedenen Kategorien, Schwierigkeitsgraden und einem Mehrspieler-Modus.

## ✨ Features

- **📚 Mehrere Kategorien**: Allgemeinwissen, Geografie und erweiterbar
- **🎯 Schwierigkeitsgrade**: Einfach, Mittel, Schwer
- **👥 Mehrspieler-Modus**: Bis zu 8 Spieler gleichzeitig
- **🎲 Zufällige Fragen**: Jedes Quiz ist anders
- **⏭️ Skip-Funktion**: Fragen überspringen wenn nötig
- **🚫 Blacklist-System**: Fragen permanent sperren
- **🏆 Leaderboard**: Punktzahl-Tracking und Gewinner-Ermittlung
- **🎮 Quiz-Modi**: Gemischt oder kategorieweise
- **📱 Responsive Design**: Funktioniert auf allen Geräten

## 🚀 Installation

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm oder yarn

### Installation

1. **Repository klonen oder herunterladen**
   ```bash
   git clone <repository-url>
   cd Quizapp
   ```

2. **Dependencies installieren**
   ```bash
   npm run install-all
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

4. **App öffnen**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎮 Verwendung

### 1. Quiz einrichten
- Wähle Kategorien aus (Allgemeinwissen, Geografie)
- Wähle Schwierigkeitsgrade (Einfach, Mittel, Schwer)
- Entscheide zwischen gemischtem oder kategorieweisem Modus
- Bestimme die Anzahl der Fragen (5-50)

### 2. Spieler hinzufügen
- Füge bis zu 8 Spieler mit Namen hinzu
- Jeder Spieler bekommt eine eigene Farbe

### 3. Quiz spielen
- Der Quizmaster sieht direkt die richtige Antwort
- Klicke auf einen Spieler, der die Frage beantworten soll
- Klicke "Punkt vergeben" für richtige Antworten
- Nutze "⏭️ Überspringen & Nachladen" um eine neue Frage zu bekommen
- Nutze "🚫 Blacklist & Nachladen" um Fragen zu sperren und neue zu laden
- Die Gesamtanzahl der Fragen bleibt konstant
- Verfolge die Punktzahl in Echtzeit

### 4. Blacklist verwalten
- Gehe zu "🚫 Blacklist verwalten" auf der Startseite
- Sieh alle gesperrten Fragen
- Entferne Fragen von der Blacklist mit "✅ Entfernen"
- Gesperrte Fragen werden nie wieder in Quiz-Runden angezeigt

### 5. Ergebnis ansehen
- Am Ende wird das finale Leaderboard angezeigt
- Der Gewinner wird hervorgehoben
- Option für ein neues Quiz

## 🛠️ Entwicklung

### Projektstruktur

```
Quizapp/
├── server/                 # Backend (Node.js/Express)
│   ├── index.js           # Server-Hauptdatei
│   └── data/              # JSON-Datenbank
│       ├── categories.json
│       └── questions.json
├── client/                # Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/    # React-Komponenten
│   │   ├── services/      # API-Services
│   │   ├── types/         # TypeScript-Typen
│   │   └── App.tsx        # Haupt-App
│   └── public/            # Statische Dateien
└── package.json           # Root package.json
```

### Neue Kategorien hinzufügen

1. **Backend**: Neue Kategorie in `server/data/categories.json` hinzufügen
2. **Fragen**: Entsprechende Fragen in `server/data/questions.json` hinzufügen
3. **Format**:
   ```json
   {
     "id": "neue-kategorie",
     "name": "Neue Kategorie",
     "description": "Beschreibung der Kategorie",
     "difficulties": ["einfach", "mittel", "schwer"]
   }
   ```

### Neue Fragen hinzufügen

```json
{
  "id": "unique-id",
  "category": "kategorie-id",
  "difficulty": "einfach|mittel|schwer",
  "question": "Deine Frage hier?",
  "correctAnswer": "Richtige Antwort",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}
```

### API Endpoints

- `GET /api/categories` - Alle Kategorien abrufen
- `GET /api/questions` - Fragen nach Kategorie/Schwierigkeit
- `POST /api/categories` - Neue Kategorie hinzufügen
- `POST /api/questions` - Neue Frage hinzufügen

## 🎨 Technologien

### Frontend
- **React 18** mit TypeScript
- **React Router** für Navigation
- **Axios** für API-Kommunikation
- **CSS3** mit modernem Design

### Backend
- **Node.js** mit Express
- **JSON-Dateien** als einfache Datenbank
- **CORS** für Cross-Origin Requests

## 📱 Features im Detail

### Kategorien-System
- **Allgemeinwissen**: Allgemeine Fragen zu verschiedenen Themen
- **Geografie**: Länder, Städte, geografische Besonderheiten
- **Erweiterbar**: Einfach neue Kategorien hinzufügen

### Schwierigkeitsgrade
- **Einfach**: Grundlegende Fragen
- **Mittel**: Fortgeschrittene Fragen
- **Schwer**: Experten-Fragen

### Quiz-Modi
- **Gemischt**: Alle Fragen zufällig gemischt
- **Kategorieweise**: Kategorien einzeln abarbeiten

### Spieler-Management
- Bis zu 8 Spieler
- Individuelle Farben
- Echtzeit-Punktzahl
- Gewinner-Ermittlung

## 🔧 Konfiguration

### Umgebungsvariablen

```bash
# .env (optional)
REACT_APP_API_URL=http://localhost:5000/api
PORT=5000
```

### Ports ändern

- **Frontend**: Ändere in `client/package.json` den `proxy`-Wert
- **Backend**: Ändere `PORT` in `server/index.js`

## 🚀 Deployment

### Netlify (Empfohlen)

1. **GitHub Repository erstellen**
2. **Code hochladen**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/DEIN_USERNAME/quizmaster-app.git
   git push -u origin main
   ```

3. **Netlify verbinden**:
   - Gehe zu [netlify.com](https://netlify.com)
   - "New site from Git"
   - Wähle dein GitHub Repository
   - Build-Einstellungen:
     - **Build command**: `npm run build`
     - **Publish directory**: `client/build`

4. **Backend deployen** (Render.com):
   - Gehe zu [render.com](https://render.com)
   - "New Web Service"
   - Verbinde mit GitHub
   - Wähle `server` Ordner
   - **Build command**: `npm install`
   - **Start command**: `npm start`

### Lokaler Build

```bash
# Frontend build
cd client
npm run build

# Backend starten
cd ../server
npm start
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:
1. Überprüfe die Konsole auf Fehlermeldungen
2. Stelle sicher, dass alle Dependencies installiert sind
3. Überprüfe, ob beide Server laufen (Frontend + Backend)

## 🎯 Roadmap

- [ ] Mehr Kategorien (Sport, Geschichte, etc.)
- [ ] Bilder in Fragen
- [ ] Sound-Effekte
- [ ] Timer für Fragen
- [ ] Multiplayer über Netzwerk
- [ ] Quiz-Statistiken
- [ ] Export/Import von Quiz-Daten 