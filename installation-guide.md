# Home Office Planer - Installation und Korrekturen

## Hauptkorrekturen des ursprünglichen Codes

### 1. Firebase Integration
- **Problem**: Dynamische Imports von Firebase-Modulen funktionierten nicht zuverlässig
- **Lösung**: Verwendung von Firebase-CDN und statischer Initialisierung
- **Änderung**: Firebase-Module werden über CDN geladen anstatt dynamisch importiert

### 2. Passwort-Hashing
- **Problem**: Inkonsistente Hashing-Methoden (SHA-256 vs simpleHash) führten zu Login-Problemen
- **Lösung**: Einheitliche SHA-256-Hashing für alle Passwörter
- **Änderung**: Alle Standard-Passwörter werden mit SHA-256 gehashed und gespeichert

### 3. Event-Listener Setup
- **Problem**: Event-Listener wurden möglicherweise vor DOM-Bereitschaft registriert
- **Lösung**: Robuste DOM-Ready-Behandlung mit DOMContentLoaded
- **Änderung**: Alle Event-Listener werden erst nach DOM-Bereitschaft registriert

### 4. Firebase-Datenstruktur
- **Problem**: Unklare Datenstruktur für Benutzerdaten und Pläne
- **Lösung**: Klare Hierarchie mit `users/{uid}` und `plans/{uid}/{month}`
- **Änderung**: Strukturierte Datenorganisation für bessere Performance

### 5. Offline-Funktionalität
- **Problem**: Keine Fallback-Mechanismen bei Firebase-Ausfall
- **Lösung**: Lokale Datenspeicherung als Backup
- **Änderung**: Daten werden lokal zwischengespeichert und bei Wiederverbindung synchronisiert

## Installation

### 1. Firebase-Setup (bereits konfiguriert)
Die Firebase-Konfiguration ist bereits eingerichtet:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
  authDomain: "homeoffice-planer-drv.firebaseapp.com",
  databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "homeoffice-planer-drv",
  storageBucket: "homeoffice-planer-drv.firebasestorage.app",
  messagingSenderId: "669565818222",
  appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
};
```

### 2. Dateien-Upload
Laden Sie folgende Dateien in Ihr Web-Hosting hoch:
- `index.html` - Hauptdatei
- `style.css` - Styling
- `app.js` - JavaScript-Funktionalität

### 3. Firebase-CDN
Die App lädt Firebase automatisch über CDN. Keine zusätzlichen Installationen nötig.

## Standard-Login-Daten

### Mitarbeiter:
- **Namen**: Torsten, Anna, Michael, Sarah, Thomas
- **Standard-Passwort**: `password123`

### Teamleiter:
- **Passwort**: `teamleiter123`

### Neuer Mitarbeiter:
- Registrierung mit eigenem Namen und Passwort (min. 6 Zeichen)

## Funktionen

### Mitarbeiter:
- ✅ Login mit Namen und Passwort
- ✅ Kalender-Ansicht mit Monatsnavigation
- ✅ Status setzen: Home-Office, Büro, Urlaub, AZ
- ✅ Home-Office-Quote überwachen
- ✅ Passwort ändern
- ✅ Account löschen

### Teamleiter:
- ✅ Alle Mitarbeiter-Funktionen
- ✅ Team-Übersicht mit Statistiken
- ✅ Mitarbeiter-Details einsehen
- ✅ Passwörter zurücksetzen
- ✅ Accounts verwalten
- ✅ Export-Funktionalität
- ✅ Berichte generieren

### System:
- ✅ Deutsche Feiertage 2025-2030
- ✅ Firebase Realtime Database
- ✅ Offline-Modus
- ✅ Responsive Design
- ✅ Mobile-freundlich

## Online-Stellung

### Option 1: GitHub Pages
1. Erstellen Sie ein GitHub-Repository
2. Laden Sie alle Dateien hoch
3. Aktivieren Sie GitHub Pages in den Repository-Einstellungen
4. Ihre App ist verfügbar unter: `https://username.github.io/repository-name`

### Option 2: Netlify
1. Besuchen Sie netlify.com
2. Ziehen Sie den Ordner mit allen Dateien auf die Netlify-Seite
3. Ihre App wird automatisch deployed

### Option 3: Vercel
1. Besuchen Sie vercel.com
2. Verbinden Sie Ihr GitHub-Repository oder laden Sie Dateien direkt hoch
3. Automatisches Deployment

### Option 4: Eigener Webserver
1. Laden Sie alle Dateien in das Web-Root-Verzeichnis Ihres Servers
2. Stellen Sie sicher, dass HTTPS aktiviert ist (für Firebase erforderlich)
3. App ist unter Ihrer Domain erreichbar

## Wichtige Hinweise

1. **HTTPS erforderlich**: Firebase funktioniert nur über HTTPS
2. **Moderne Browser**: Benötigt einen aktuellen Browser für crypto.subtle (SHA-256)
3. **Internet-Verbindung**: Für Firebase-Synchronisation erforderlich
4. **Backup**: Lokale Daten werden bei Browser-Cache-Löschung entfernt

## Fehlerbehebung

### Login funktioniert nicht:
- Prüfen Sie die Netzwerkverbindung
- Stellen Sie sicher, dass Firebase erreichbar ist
- Verwenden Sie HTTPS

### Daten werden nicht gespeichert:
- Überprüfen Sie die Firebase-Verbindung
- Prüfen Sie Browser-Konsole auf Fehler
- Stellen Sie sicher, dass JavaScript aktiviert ist

### Kalender zeigt falsche Daten:
- Aktualisieren Sie die Seite
- Prüfen Sie die System-Zeitzone
- Löschen Sie Browser-Cache

## Support

Bei Problemen:
1. Öffnen Sie die Browser-Entwicklertools (F12)
2. Prüfen Sie die Konsole auf Fehlermeldungen
3. Überprüfen Sie die Netzwerk-Registerkarte für Firebase-Anfragen
4. Dokumentieren Sie Fehlermeldungen für weitere Hilfe