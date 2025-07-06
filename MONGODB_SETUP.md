# 🗄️ MongoDB Atlas Setup - Quizmaster App

## 📋 Schritt-für-Schritt Anleitung

### 1. MongoDB Atlas Account erstellen

1. **Gehe zu [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Klicke auf "Try Free"**
3. **Erstelle einen kostenlosen Account**
4. **Wähle "Free Tier" (M0)**

### 2. Cluster erstellen

1. **Cluster Name:** `Cluster0` (Standard-Name, kann nicht geändert werden)
2. **Cloud Provider:** AWS (kostenlos)
3. **Region:** Frankfurt (eu-central-1) - für bessere Performance
4. **Cluster Tier:** M0 (kostenlos)
5. **Klicke "Create Cluster"**

### 3. Datenbank-Benutzer erstellen

1. **Gehe zu "Database Access"**
2. **Klicke "Add New Database User"**
3. **Username:** `quizmaster-user`
4. **Password:** Erstelle ein sicheres Passwort (speichere es!)
5. **Database User Privileges:** "Read and write to any database"
6. **Klicke "Add User"**

### 4. IP-Whitelist konfigurieren

1. **Gehe zu "Network Access"**
2. **Klicke "Add IP Address"**
3. **Für Entwicklung:** `0.0.0.0/0` (alle IPs erlauben)
4. **Für Produktion:** Nur Render IPs erlauben
5. **Klicke "Confirm"**

### 5. Connection String erhalten

1. **Gehe zu "Database"**
2. **Klicke "Connect"**
3. **Wähle "Connect your application"**
4. **Kopiere den Connection String**

**Wichtiger Hinweis:** Der Connection String sieht so aus:
```
mongodb+srv://quizmaster-user:DEIN_PASSWORT@cluster0.xxxxx.mongodb.net/quizmaster?retryWrites=true&w=majority
```

### 6. Environment Variables setzen

**Für lokale Entwicklung:**
```bash
# .env Datei im server/ Ordner erstellen
MONGODB_URI=mongodb+srv://quizmaster-user:DEIN_PASSWORT@cluster0.xxxxx.mongodb.net/quizmaster?retryWrites=true&w=majority
PORT=5001
NODE_ENV=development
```

**Für Render Deployment:**
1. **Gehe zu deinem Render Service**
2. **Environment → Environment Variables**
3. **Füge hinzu:**
   - `MONGODB_URI` = Dein Connection String
   - `NODE_ENV` = `production`

### 7. Dependencies installieren

```bash
cd server
npm install
```

### 8. Migration testen

```bash
# Server starten
npm run dev

# Migration läuft automatisch beim ersten Start
```

### 9. Health Check testen

```bash
# Teste die Verbindung
curl http://localhost:5001/api/health
```

## 🔧 Troubleshooting

### Problem: Connection Timeout
**Lösung:**
- Überprüfe IP-Whitelist
- Stelle sicher, dass `0.0.0.0/0` hinzugefügt wurde

### Problem: Authentication Failed
**Lösung:**
- Überprüfe Username/Password
- Stelle sicher, dass der User "Read and write" Rechte hat

### Problem: Migration fehlgeschlagen
**Lösung:**
- Überprüfe Connection String
- Stelle sicher, dass alle Dependencies installiert sind

## 📊 Monitoring

### MongoDB Atlas Dashboard
- **Database:** Sieh deine Collections
- **Performance:** Überwache Query-Performance
- **Logs:** Debugging-Informationen

### Health Check Endpoint
```bash
GET /api/health
```
Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "stats": {
    "questions": 10,
    "categories": 2,
    "blacklist": 4
  }
}
```

## 🚀 Deployment

### Render Environment Variables
```bash
MONGODB_URI=mongodb+srv://quizmaster-user:DEIN_PASSWORT@cluster0.xxxxx.mongodb.net/quizmaster?retryWrites=true&w=majority
NODE_ENV=production
```

### Automatische Migration
- Migration läuft automatisch beim ersten Deployment
- Bestehende Daten werden migriert
- Keine manuellen Schritte nötig

## ✅ Checkliste

- [ ] MongoDB Atlas Account erstellt
- [ ] Cluster erstellt (Cluster0 - Standard-Name)
- [ ] Database User erstellt
- [ ] IP-Whitelist konfiguriert
- [ ] Connection String kopiert
- [ ] Environment Variables gesetzt
- [ ] Dependencies installiert
- [ ] Server gestartet
- [ ] Health Check erfolgreich
- [ ] Migration abgeschlossen

## 🎯 Nächste Schritte

1. **MongoDB Atlas Setup** (30 Minuten)
2. **Environment Variables setzen** (5 Minuten)
3. **Server testen** (5 Minuten)
4. **Deployment auf Render** (10 Minuten)

**Gesamtzeit:** ~50 Minuten für vollständige MongoDB-Integration!

## 📝 Wichtige Hinweise

- **Cluster-Name:** "Cluster0" ist der Standard-Name und kann nicht geändert werden
- **Connection String:** Verwende den exakten String aus MongoDB Atlas
- **Datenbank-Name:** "quizmaster" wird automatisch erstellt
- **Collections:** Werden automatisch erstellt beim ersten Start 