// homeoffice-planner.js

// Import Firebase-Bibliotheken
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, remove, onValue, off } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Deine Firebase-Konfiguration wurde hier eingefügt
const firebaseConfig = {
    apiKey: "AIzaSyDtPxYtqFSUcWrT7zJ-mjAQyPvCsMYZ6zg",
    authDomain: "ho-planerv2.firebaseapp.com",
    databaseURL: "https://ho-planerv2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ho-planerv2",
    storageBucket: "ho-planerv2.firebasestorage.app",
    messagingSenderId: "203584570304",
    appId: "1:203584570304:web:4c5337ce60ed52ed67fe25",
    measurementId: "G-1QB1ZM8CBL" // Measurement ID ist optional
};

class HomeOfficePlanner {
    constructor() {
        // Firebase integration
        this.isFirebaseEnabled = false;
        this.app = null;
        this.auth = null;
        this.database = null;
        this.currentUser = null;
        this.currentUserUID = null;
        this.userRole = null;
        this.dataListeners = new Map(); // Track active listeners

        // Extended holidays data through 2030
        this.holidays = {
            "2025": [{ "datum": "2025-01-01", "name": "Neujahr" }, { "datum": "2025-04-18", "name": "Karfreitag" }, { "datum": "2025-04-21", "name": "Ostermontag" }, { "datum": "2025-05-01", "name": "Tag der Arbeit" }, { "datum": "2025-05-29", "name": "Christi Himmelfahrt" }, { "datum": "2025-06-09", "name": "Pfingstmontag" }, { "datum": "2025-06-19", "name": "Fronleichnam" }, { "datum": "2025-08-15", "name": "Mariä Himmelfahrt" }, { "datum": "2025-10-03", "name": "Tag der Deutschen Einheit" }, { "datum": "2025-11-01", "name": "Allerheiligen" }, { "datum": "2025-12-25", "name": "1. Weihnachtsfeiertag" }, { "datum": "2025-12-26", "name": "2. Weihnachtsfeiertag" }],
            "2026": [{ "datum": "2026-01-01", "name": "Neujahr" }, { "datum": "2026-04-03", "name": "Karfreitag" }, { "datum": "2026-04-06", "name": "Ostermontag" }, { "datum": "2026-05-01", "name": "Tag der Arbeit" }, { "datum": "2026-05-14", "name": "Christi Himmelfahrt" }, { "datum": "2026-05-25", "name": "Pfingstmontag" }, { "datum": "2026-06-04", "name": "Fronleichnam" }, { "datum": "2026-08-15", "name": "Mariä Himmelfahrt" }, { "datum": "2026-10-03", "name": "Tag der Deutschen Einheit" }, { "datum": "2026-11-01", "name": "Allerheiligen" }, { "datum": "2026-12-25", "name": "1. Weihnachtsfeiertag" }, { "datum": "2026-12-26", "name": "2. Weihnachtsfeiertag" }],
            "2027": [{ "datum": "2027-01-01", "name": "Neujahr" }, { "datum": "2027-03-26", "name": "Karfreitag" }, { "datum": "2027-03-29", "name": "Ostermontag" }, { "datum": "2027-05-01", "name": "Tag der Arbeit" }, { "datum": "2027-05-06", "name": "Christi Himmelfahrt" }, { "datum": "2027-05-17", "name": "Pfingstmontag" }, { "datum": "2027-05-27", "name": "Fronleichnam" }, { "datum": "2027-08-15", "name": "Mariä Himmelfahrt" }, { "datum": "2027-10-03", "name": "Tag der Deutschen Einheit" }, { "datum": "2027-11-01", "name": "Allerheiligen" }, { "datum": "2027-12-25", "name": "1. Weihnachtsfeiertag" }, { "datum": "2027-12-26", "name": "2. Weihnachtsfeiertag" }],
            "2028": [{ "datum": "2028-01-01", "name": "Neujahr" }, { "datum": "2028-04-14", "name": "Karfreitag" }, { "datum": "2028-04-17", "name": "Ostermontag" }, { "datum": "2028-05-01", "name": "Tag der Arbeit" }, { "datum": "2028-05-25", "name": "Christi Himmelfahrt" }, { "datum": "2028-06-05", "name": "Pfingstmontag" }, { "datum": "2028-06-15", "name": "Fronleichnam" }, { "datum": "2028-08-15", "name": "Mariä Himmelfahrt" }, { "datum": "2028-10-03", "name": "Tag der Deutschen Einheit" }, { "datum": "2028-11-01", "name": "Allerheiligen" }, { "datum": "2028-12-25", "name": "1. Weihnachtsfeiertag" }, { "datum": "2028-12-26", "name": "2. Weihnachtsfeiertag" }],
            "2029": [{ "datum": "2029-01-01", "name": "Neujahr" }, { "datum": "2029-03-30", "name": "Karfreitag" }, { "datum": "2029-04-02", "name": "Ostermontag" }, { "datum": "2029-05-01", "name": "Tag der Arbeit" }, { "datum": "2029-05-10", "name": "Christi Himmelfahrt" }, { "datum": "2029-05-21", "name": "Pfingstmontag" }, { "datum": "2029-05-31", "name": "Fronleichnam" }, { "datum": "2029-08-15", "name": "Mariä Himmelfahrt" }, { "datum": "2029-10-03", "name": "Tag der Deutschen Einheit" }, { "datum": "2029-11-01", "name": "Allerheiligen" }, { "datum": "2029-12-25", "name": "1. Weihnachtsfeiertag" }, { "datum": "2029-12-26", "name": "2. Weihnachtsfeiertag" }],
            "2030": [{ "datum": "2030-01-01", "name": "Neujahr" }, { "datum": "2030-04-19", "name": "Karfreitag" }, { "datum": "2030-04-22", "name": "Ostermontag" }, { "datum": "2030-05-01", "name": "Tag der Arbeit" }, { "datum": "2030-05-30", "name": "Christi Himmelfahrt" }, { "datum": "2030-06-10", "name": "Pfingstmontag" }, { "datum": "2030-06-20", "name": "Fronleichnam" }, { "datum": "2030-08-15", "name": "Mariä Himmelfahrt" }, { "datum": "2030-10-03", "name": "Tag der Deutschen Einheit" }, { "datum": "2030-11-01", "name": "Allerheiligen" }, { "datum": "2030-12-25", "name": "1. Weihnachtsfeiertag" }, { "datum": "2030-12-26", "name": "2. Weihnachtsfeiertag" }]
        };

        this.statusTypes = {
            "homeoffice": { "name": "Home-Office", "color": "#FF8C00", "symbol": "🏠" },
            "buero": { "name": "Büro", "color": "#4169E1", "symbol": "🏢" },
            "urlaub": { "name": "Urlaub", "color": "#32CD32", "symbol": "🏖️" },
            "az": { "name": "AZ", "color": "#808080", "symbol": "⏰" }
        };

        // Application state
        this.colleagues = []; // Wird von Firebase geladen
        this.planningData = {}; // Wird von Firebase geladen
        this.homeofficeRules = {}; // Wird von Firebase geladen
        this.selectedDateForStatus = null;
        this.activeTab = 'overview';
        this.selectedColleagueForAction = null;
        this.isTeamOverviewMode = false;
        
    }

    // ===== FIREBASE INTEGRATION & AUTHENTICATION =====

    async initializeFirebase() {
        try {
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.database = getDatabase(this.app);
            this.isFirebaseEnabled = true;

            onAuthStateChanged(this.auth, (user) => {
                if (user) {
                    this.currentUserUID = user.uid;
                    this.updateConnectionStatus('🟢 Firebase verbunden');
                    this.loadUserProfile(user.uid);
                    this.showMainApp();
                } else {
                    this.currentUser = null;
                    this.currentUserUID = null;
                    this.userRole = null;
                    this.updateConnectionStatus('🔴 Offline Modus');
                    this.showLoginScreen();
                }
            });
            console.log('Firebase initialized. Awaiting authentication state...');
            return true;

        } catch (error) {
            console.error('Firebase initialization failed:', error);
            this.isFirebaseEnabled = false;
            this.updateConnectionStatus('🔴 Initialisierungsfehler');
            return false;
        }
    }

    async loadUserProfile(uid) {
        const profileRef = ref(this.database, `users/${uid}/profile`);
        onValue(profileRef, (snapshot) => {
            const profile = snapshot.val();
            if (profile) {
                this.currentUser = profile.name;
                this.userRole = profile.role;
                this.showViewForRole();
                this.updateDashboard(this.currentUser);
                this.setupDataListeners(this.currentUserUID);
            }
        });
    }

    async registerNewEmployee(email, password, name) {
        if (!this.isFirebaseEnabled) {
            alert("Offline Modus. Registrierung nicht möglich.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            await set(ref(this.database, `users/${user.uid}/profile`), {
                name: name,
                role: 'employee',
                quota: 40,
                email: email
            });
            alert(`Mitarbeiter ${name} erfolgreich registriert!`);
        } catch (error) {
            console.error('Fehler bei der Registrierung:', error.message);
            alert(`Fehler bei der Registrierung: ${error.message}`);
        }
    }
    
    async loginUser(email, password, role) {
        if (!this.isFirebaseEnabled) {
            alert("Offline Modus. Login nicht möglich.");
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            // Der Rest der Logik wird von onAuthStateChanged gehandhabt.
        } catch (error) {
            console.error('Login-Fehler:', error.message);
            alert(`Login-Fehler: ${error.message}`);
        }
    }

    async logout() {
        if (this.isFirebaseEnabled) {
            await signOut(this.auth);
            this.cleanupListeners();
            this.showLoginScreen();
        } else {
            // Offline-Modus: Simuliere Logout
            this.currentUser = null;
            this.userRole = null;
            this.showLoginScreen();
        }
    }

    cleanupListeners() {
        // Entferne alle aktiven onValue Listener, um Speicherlecks zu vermeiden
        this.dataListeners.forEach((listener, path) => {
            off(ref(this.database, path), listener);
        });
        this.dataListeners.clear();
    }
    
    // ===== FIREBASE DATA OPERATIONS =====

    async writeData(path, data) {
        if (!this.isFirebaseEnabled) return;
        try {
            await set(ref(this.database, path), data);
        } catch (error) {
            console.error('Error writing data:', error);
        }
    }

    async updateData(path, updates) {
        if (!this.isFirebaseEnabled) return;
        try {
            await update(ref(this.database, path), updates);
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    async removeData(path) {
        if (!this.isFirebaseEnabled) return;
        try {
            await remove(ref(this.database, path));
        } catch (error) {
            console.error('Error removing data:', error);
        }
    }

    async savePlanningData(date, status) {
        if (!this.currentUserUID) {
            console.error('Kein Benutzer angemeldet. Speichern nicht möglich.');
            return;
        }
        const yearMonth = date.substring(0, 7); // YYYY-MM
        const path = `plans/${this.currentUserUID}/${yearMonth}/${date}`;

        if (status) {
            await this.writeData(path, status);
        } else {
            await this.removeData(path);
        }
    }

    // Die folgenden Methoden sind wichtig für die Echtzeit-Synchronisierung
    setupDataListeners(uid) {
        this.cleanupListeners(); // Vorherige Listener entfernen
        
        const planningRef = ref(this.database, `plans/${uid}`);
        const planningListener = onValue(planningRef, (snapshot) => {
            this.planningData = snapshot.val() || {};
            this.renderCalendar();
            this.updateDashboard(this.currentUser);
        });
        this.dataListeners.set(`plans/${uid}`, planningListener);

        const colleaguesRef = ref(this.database, 'users');
        const colleaguesListener = onValue(colleaguesRef, (snapshot) => {
            const users = snapshot.val();
            this.colleagues = Object.values(users || {}).map(user => user.profile.name);
            this.populateEmployeeSelect();
        });
        this.dataListeners.set('users', colleaguesListener);
    }
    
    setupTeamDataListeners() {
        this.cleanupListeners();
        
        const teamPlansRef = ref(this.database, 'plans');
        const teamPlansListener = onValue(teamPlansRef, (snapshot) => {
            this.planningData = snapshot.val() || {};
            this.renderTeamOverview();
        });
        this.dataListeners.set('plans', teamPlansListener);
    }

    // Weitere Methoden hier...
    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        this.showLoginType('employee');
    }

    showMainApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
    }
    
    showLoginType(type) {
        const employeeLogin = document.getElementById('employeeLogin');
        const teamleaderLogin = document.getElementById('teamleaderLogin');
        const newEmployeeRegister = document.getElementById('newEmployeeRegister');

        if (employeeLogin) employeeLogin.style.display = 'none';
        if (teamleaderLogin) teamleaderLogin.style.display = 'none';
        if (newEmployeeRegister) newEmployeeRegister.style.display = 'none';

        if (type === 'employee' && employeeLogin) {
            employeeLogin.style.display = 'block';
        } else if (type === 'teamleader' && teamleaderLogin) {
            teamleaderLogin.style.display = 'block';
        } else if (type === 'new-employee' && newEmployeeRegister) {
            newEmployeeRegister.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Event-Handler für die Buttons und Formulare
        document.getElementById('userType')?.addEventListener('change', (e) => this.showLoginType(e.target.value));
        document.getElementById('employeeLoginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('employeeEmail').value;
            const password = document.getElementById('employeePassword').value;
            this.loginUser(email, password, 'employee');
        });
        document.getElementById('teamleaderLoginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('teamleaderEmail').value;
            const password = document.getElementById('teamleaderPassword').value;
            this.loginUser(email, password, 'teamleader');
        });
        document.getElementById('newEmployeeRegisterBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const name = document.getElementById('newEmployeeName').value;
            const email = document.getElementById('newEmployeeEmail').value;
            const password = document.getElementById('newEmployeePassword').value;
            const confirmPassword = document.getElementById('newEmployeePasswordConfirm').value;
            if (password !== confirmPassword) {
                alert('Passwörter stimmen nicht überein.');
                return;
            }
            this.registerNewEmployee(email, password, name);
        });
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.querySelectorAll('#mainApp nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.getAttribute('data-tab'));
            });
        });
        // ... weitere Event-Listener ...
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateLiveStatus(status) {
        const statusElement = document.getElementById('liveStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    // Platzhalter für weitere Methoden...
    renderCalendar() {
        console.log('Rendering calendar...');
        // Fügen Sie hier Ihre Logik zum Rendern des Kalenders ein
    }

    updateDashboard(user) {
        console.log('Updating dashboard for:', user);
        // Fügen Sie hier Ihre Logik zur Aktualisierung des Dashboards ein
    }

    showViewForRole() {
        console.log('Showing view for role:', this.userRole);
        // Fügen Sie hier Ihre Logik zum Anzeigen der richtigen Benutzeroberfläche basierend auf der Rolle ein
    }
    
    renderTeamOverview() {
        console.log('Rendering team overview...');
        // Fügen Sie hier Ihre Logik zum Rendern der Team-Übersicht ein
    }
    
    switchTab(tab) {
        console.log('Switching to tab:', tab);
        // Fügen Sie hier Ihre Logik zum Wechseln der Tabs ein
    }

    init() {
        this.initializeFirebase();
        this.setupEventListeners();
    }
}

// Globaler Initialisierungs-Aufruf
const planner = new HomeOfficePlanner();
document.addEventListener('DOMContentLoaded', () => {
    planner.init();
});
