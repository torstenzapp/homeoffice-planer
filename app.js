// HomeOffice-Planer - Vollständig funktionsfähige App mit Firebase Live-Sync
class HomeOfficePlanner {
    constructor() {
        // Firebase Configuration - ECHTE DATEN
        this.firebaseConfig = {
            apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
            authDomain: "homeoffice-planer-drv.firebaseapp.com",
            databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "homeoffice-planer-drv",
            storageBucket: "homeoffice-planer-drv.firebasestorage.app",
            messagingSenderId: "669565818222",
            appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
        };

        // Firebase state
        this.isFirebaseEnabled = false;
        this.database = null;
        this.currentUserUID = null;
        this.dataListeners = new Map();
        this.isOnline = navigator.onLine;
        
        // Extended holidays data through 2030
        this.holidays = {
            "2025": [
                {"datum": "2025-01-01", "name": "Neujahr"},
                {"datum": "2025-04-18", "name": "Karfreitag"},
                {"datum": "2025-04-21", "name": "Ostermontag"},
                {"datum": "2025-05-01", "name": "Tag der Arbeit"},
                {"datum": "2025-05-29", "name": "Christi Himmelfahrt"},
                {"datum": "2025-06-09", "name": "Pfingstmontag"},
                {"datum": "2025-06-19", "name": "Fronleichnam"},
                {"datum": "2025-08-15", "name": "Mariä Himmelfahrt"},
                {"datum": "2025-10-03", "name": "Tag der Deutschen Einheit"},
                {"datum": "2025-11-01", "name": "Allerheiligen"},
                {"datum": "2025-12-25", "name": "1. Weihnachtsfeiertag"},
                {"datum": "2025-12-26", "name": "2. Weihnachtsfeiertag"}
            ],
            "2026": [
                {"datum": "2026-01-01", "name": "Neujahr"},
                {"datum": "2026-04-03", "name": "Karfreitag"},
                {"datum": "2026-04-06", "name": "Ostermontag"},
                {"datum": "2026-05-01", "name": "Tag der Arbeit"},
                {"datum": "2026-05-14", "name": "Christi Himmelfahrt"},
                {"datum": "2026-05-25", "name": "Pfingstmontag"},
                {"datum": "2026-06-04", "name": "Fronleichnam"},
                {"datum": "2026-08-15", "name": "Mariä Himmelfahrt"},
                {"datum": "2026-10-03", "name": "Tag der Deutschen Einheit"},
                {"datum": "2026-11-01", "name": "Allerheiligen"},
                {"datum": "2026-12-25", "name": "1. Weihnachtsfeiertag"},
                {"datum": "2026-12-26", "name": "2. Weihnachtsfeiertag"}
            ],
            "2027": [
                {"datum": "2027-01-01", "name": "Neujahr"},
                {"datum": "2027-03-26", "name": "Karfreitag"},
                {"datum": "2027-03-29", "name": "Ostermontag"},
                {"datum": "2027-05-01", "name": "Tag der Arbeit"},
                {"datum": "2027-05-06", "name": "Christi Himmelfahrt"},
                {"datum": "2027-05-17", "name": "Pfingstmontag"},
                {"datum": "2027-05-27", "name": "Fronleichnam"},
                {"datum": "2027-08-15", "name": "Mariä Himmelfahrt"},
                {"datum": "2027-10-03", "name": "Tag der Deutschen Einheit"},
                {"datum": "2027-11-01", "name": "Allerheiligen"},
                {"datum": "2027-12-25", "name": "1. Weihnachtsfeiertag"},
                {"datum": "2027-12-26", "name": "2. Weihnachtsfeiertag"}
            ],
            "2028": [
                {"datum": "2028-01-01", "name": "Neujahr"},
                {"datum": "2028-04-14", "name": "Karfreitag"},
                {"datum": "2028-04-17", "name": "Ostermontag"},
                {"datum": "2028-05-01", "name": "Tag der Arbeit"},
                {"datum": "2028-05-25", "name": "Christi Himmelfahrt"},
                {"datum": "2028-06-05", "name": "Pfingstmontag"},
                {"datum": "2028-06-15", "name": "Fronleichnam"},
                {"datum": "2028-08-15", "name": "Mariä Himmelfahrt"},
                {"datum": "2028-10-03", "name": "Tag der Deutschen Einheit"},
                {"datum": "2028-11-01", "name": "Allerheiligen"},
                {"datum": "2028-12-25", "name": "1. Weihnachtsfeiertag"},
                {"datum": "2028-12-26", "name": "2. Weihnachtsfeiertag"}
            ],
            "2029": [
                {"datum": "2029-01-01", "name": "Neujahr"},
                {"datum": "2029-03-30", "name": "Karfreitag"},
                {"datum": "2029-04-02", "name": "Ostermontag"},
                {"datum": "2029-05-01", "name": "Tag der Arbeit"},
                {"datum": "2029-05-10", "name": "Christi Himmelfahrt"},
                {"datum": "2029-05-21", "name": "Pfingstmontag"},
                {"datum": "2029-05-31", "name": "Fronleichnam"},
                {"datum": "2029-08-15", "name": "Mariä Himmelfahrt"},
                {"datum": "2029-10-03", "name": "Tag der Deutschen Einheit"},
                {"datum": "2029-11-01", "name": "Allerheiligen"},
                {"datum": "2029-12-25", "name": "1. Weihnachtsfeiertag"},
                {"datum": "2029-12-26", "name": "2. Weihnachtsfeiertag"}
            ],
            "2030": [
                {"datum": "2030-01-01", "name": "Neujahr"},
                {"datum": "2030-04-19", "name": "Karfreitag"},
                {"datum": "2030-04-22", "name": "Ostermontag"},
                {"datum": "2030-05-01", "name": "Tag der Arbeit"},
                {"datum": "2030-05-30", "name": "Christi Himmelfahrt"},
                {"datum": "2030-06-10", "name": "Pfingstmontag"},
                {"datum": "2030-06-20", "name": "Fronleichnam"},
                {"datum": "2030-08-15", "name": "Mariä Himmelfahrt"},
                {"datum": "2030-10-03", "name": "Tag der Deutschen Einheit"},
                {"datum": "2030-11-01", "name": "Allerheiligen"},
                {"datum": "2030-12-25", "name": "1. Weihnachtsfeiertag"},
                {"datum": "2030-12-26", "name": "2. Weihnachtsfeiertag"}
            ]
        };

        // App state
        this.currentUser = null;
        this.currentDate = new Date();
        this.viewDate = new Date();

        // Initialize app
        this.init();
    }

    init() {
        console.log('🚀 HomeOffice-Planer wird initialisiert...');
        this.initFirebase();
        this.setupEventListeners();
        this.setupNetworkListeners();
        this.registerServiceWorker();
        this.loadEmployees();
    }

    async initFirebase() {
        try {
            firebase.initializeApp(this.firebaseConfig);
            this.database = firebase.database();
            this.isFirebaseEnabled = true;
            console.log('✅ Firebase erfolgreich initialisiert');
            this.updateConnectionStatus();
        } catch (error) {
            console.error('❌ Firebase-Initialisierung fehlgeschlagen:', error);
            this.showError('Firebase-Verbindung fehlgeschlagen');
        }
    }

    setupEventListeners() {
        // Login type selection buttons
        document.getElementById('employeeBtn').addEventListener('click', () => this.showEmployeeLogin());
        document.getElementById('teamleaderBtn').addEventListener('click', () => this.showTeamleaderLogin());
        document.getElementById('newEmployeeBtn').addEventListener('click', () => this.showNewEmployeeForm());

        // Back buttons
        document.getElementById('employeeBackBtn').addEventListener('click', () => this.showLoginTypeSelection());
        document.getElementById('teamleaderBackBtn').addEventListener('click', () => this.showLoginTypeSelection());
        document.getElementById('newEmployeeBackBtn').addEventListener('click', () => this.showLoginTypeSelection());

        // Login buttons
        document.getElementById('employeeLoginBtn').addEventListener('click', () => this.handleEmployeeLogin());
        document.getElementById('teamleaderLoginBtn').addEventListener('click', () => this.handleTeamleaderLogin());
        document.getElementById('newEmployeeRegisterBtn').addEventListener('click', () => this.handleNewEmployeeRegister());

        // Dashboard buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('teamOverviewBtn').addEventListener('click', () => this.showTeamOverview());
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.showPasswordModal());
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.deleteAccount());

        // Calendar navigation
        document.getElementById('prevMonthBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.changeMonth(1));

        // Quota selection
        document.getElementById('quotaSelect').addEventListener('change', (e) => this.updateQuota(e.target.value));

        // Team overview back button
        document.getElementById('backToMain').addEventListener('click', () => this.showDashboard());

        // Password modal
        document.getElementById('savePasswordBtn').addEventListener('click', () => this.saveNewPassword());
        document.getElementById('cancelPasswordBtn').addEventListener('click', () => this.hidePasswordModal());

        // Enter key support
        document.getElementById('employeePassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEmployeeLogin();
        });
        document.getElementById('teamleaderPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleTeamleaderLogin();
        });
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
        });
    }

    updateConnectionStatus() {
        const statusEl = document.getElementById('connectionStatus');
        if (this.isOnline && this.isFirebaseEnabled) {
            statusEl.className = 'connection-status online';
            statusEl.classList.remove('hidden');
            setTimeout(() => statusEl.classList.add('hidden'), 3000);
        } else {
            statusEl.className = 'connection-status offline';
            statusEl.classList.remove('hidden');
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('service-worker.js');
                console.log('✅ Service Worker registriert');
            } catch (error) {
                console.log('❌ Service Worker Registrierung fehlgeschlagen:', error);
            }
        }
    }

    // Login UI Methods
    showLoginTypeSelection() {
        document.getElementById('loginTypeSelection').classList.remove('hidden');
        document.getElementById('employeeLoginForm').classList.add('hidden');
        document.getElementById('teamleaderLoginForm').classList.add('hidden');
        document.getElementById('newEmployeeForm').classList.add('hidden');
        this.hideError();
    }

    showEmployeeLogin() {
        document.getElementById('loginTypeSelection').classList.add('hidden');
        document.getElementById('employeeLoginForm').classList.remove('hidden');
        document.getElementById('employeePassword').focus();
    }

    showTeamleaderLogin() {
        document.getElementById('loginTypeSelection').classList.add('hidden');
        document.getElementById('teamleaderLoginForm').classList.remove('hidden');
        document.getElementById('teamleaderPassword').focus();
    }

    showNewEmployeeForm() {
        document.getElementById('loginTypeSelection').classList.add('hidden');
        document.getElementById('newEmployeeForm').classList.remove('hidden');
        document.getElementById('newEmployeeName').focus();
    }

    // Load employees from Firebase
    async loadEmployees() {
        if (!this.isFirebaseEnabled) return;

        try {
            const snapshot = await this.database.ref('users').once('value');
            const users = snapshot.val() || {};
            
            const employeeSelect = document.getElementById('employeeSelect');
            employeeSelect.innerHTML = '<option value="">-- Kollege auswählen --</option>';
            
            Object.keys(users).forEach(userId => {
                const user = users[userId];
                if (user.profile && user.profile.role === 'employee') {
                    const option = document.createElement('option');
                    option.value = userId;
                    option.textContent = user.profile.name;
                    employeeSelect.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Fehler beim Laden der Mitarbeiter:', error);
        }
    }

    // Password hashing
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Login handlers
    async handleEmployeeLogin() {
        const userId = document.getElementById('employeeSelect').value;
        const password = document.getElementById('employeePassword').value;

        if (!userId || !password) {
            this.showError('Bitte wählen Sie einen Namen und geben Sie das Passwort ein');
            return;
        }

        if (!this.isFirebaseEnabled) {
            this.showError('Firebase-Verbindung nicht verfügbar');
            return;
        }

        try {
            const hashedPassword = await this.hashPassword(password);
            const snapshot = await this.database.ref(`users/${userId}/profile`).once('value');
            const profile = snapshot.val();

            if (!profile) {
                this.showError('Benutzer nicht gefunden');
                return;
            }

            if (profile.passwordHash !== hashedPassword) {
                this.showError('Passwort falsch');
                return;
            }

            this.currentUser = {
                id: userId,
                name: profile.name,
                role: 'employee',
                quota: profile.quota || 40
            };

            this.showDashboard();
        } catch (error) {
            console.error('Login-Fehler:', error);
            this.showError('Anmeldung fehlgeschlagen');
        }
    }

    async handleTeamleaderLogin() {
        const password = document.getElementById('teamleaderPassword').value;

        if (!password) {
            this.showError('Bitte geben Sie das Teamleiter-Passwort ein');
            return;
        }

        const hashedPassword = await this.hashPassword(password);
        const expectedHash = await this.hashPassword('teamleiter123');

        if (hashedPassword !== expectedHash) {
            this.showError('Teamleiter-Passwort falsch');
            return;
        }

        this.currentUser = {
            id: 'teamleader',
            name: 'Teamleiter',
            role: 'teamleader',
            quota: 60
        };

        this.showDashboard();
    }

    async handleNewEmployeeRegister() {
        const name = document.getElementById('newEmployeeName').value.trim();
        const password = document.getElementById('newEmployeePassword').value;
        const passwordConfirm = document.getElementById('newEmployeePasswordConfirm').value;

        if (!name || !password || !passwordConfirm) {
            this.showError('Bitte füllen Sie alle Felder aus');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('Passwörter stimmen nicht überein');
            return;
        }

        if (!this.isFirebaseEnabled) {
            this.showError('Firebase-Verbindung nicht verfügbar');
            return;
        }

        try {
            const userId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const hashedPassword = await this.hashPassword(password);

            // Check if user already exists
            const existingUser = await this.database.ref(`users/${userId}`).once('value');
            if (existingUser.val()) {
                this.showError('Benutzer existiert bereits');
                return;
            }

            // Create new user
            await this.database.ref(`users/${userId}`).set({
                profile: {
                    name: name,
                    role: 'employee',
                    quota: 40,
                    passwordHash: hashedPassword,
                    createdAt: new Date().toISOString()
                }
            });

            this.currentUser = {
                id: userId,
                name: name,
                role: 'employee',
                quota: 40
            };

            await this.loadEmployees();
            this.showDashboard();
        } catch (error) {
            console.error('Registrierung-Fehler:', error);
            this.showError('Registrierung fehlgeschlagen');
        }
    }

    // Dashboard methods
    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
        document.getElementById('teamOverviewScreen').classList.add('hidden');

        document.getElementById('dashboardTitle').textContent = `Willkommen, ${this.currentUser.name}`;
        document.getElementById('quotaSelect').value = this.currentUser.quota;

        this.renderCalendar();
        this.updateQuotaDisplay();
    }

    showTeamOverview() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.add('hidden');
        document.getElementById('teamOverviewScreen').classList.remove('hidden');

        this.renderTeamOverview();
    }

    // Calendar methods
    async renderCalendar() {
        const calendar = document.getElementById('calendar');
        const monthHeader = document.getElementById('currentMonth');

        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();

        monthHeader.textContent = this.viewDate.toLocaleDateString('de-DE', {
            month: 'long',
            year: 'numeric'
        });

        // Clear calendar
        calendar.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day calendar-day--header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        // Get first day of month (Monday = 0)
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() + 6) % 7);

        // Load user plans for current month
        let userPlans = {};
        if (this.isFirebaseEnabled && this.currentUser.role !== 'teamleader') {
            try {
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                const snapshot = await this.database.ref(`plans/${this.currentUser.id}/${monthKey}`).once('value');
                userPlans = snapshot.val() || {};
            } catch (error) {
                console.error('Fehler beim Laden der Pläne:', error);
            }
        }

        // Create calendar days
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);

            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = cellDate.getDate();

            const dateKey = cellDate.toISOString().split('T')[0];

            // Check if date is in current month
            if (cellDate.getMonth() !== month) {
                day.classList.add('calendar-day--other-month');
            } else {
                // Check if holiday
                const holidayYear = cellDate.getFullYear().toString();
                const isHoliday = this.holidays[holidayYear]?.some(h => h.datum === dateKey);

                if (isHoliday) {
                    day.classList.add('calendar-day--disabled');
                } else {
                    // Check if today
                    const today = new Date();
                    if (cellDate.toDateString() === today.toDateString()) {
                        day.classList.add('calendar-day--today');
                    }

                    // Check if has status
                    if (userPlans[dateKey]) {
                        day.classList.add(`calendar-day--${userPlans[dateKey]}`);
                        const symbols = {
                            homeoffice: '🏠',
                            buero: '🏢',
                            urlaub: '🏖️',
                            az: '⏰'
                        };
                        day.textContent = `${cellDate.getDate()} ${symbols[userPlans[dateKey]] || ''}`;
                    }

                    // Add click handler for current user
                    if (this.currentUser.role !== 'teamleader') {
                        day.addEventListener('click', () => this.handleDayClick(dateKey));
                        day.style.cursor = 'pointer';
                    }
                }
            }

            calendar.appendChild(day);
        }
    }

    async handleDayClick(dateKey) {
        if (!this.isFirebaseEnabled) {
            this.showError('Firebase-Verbindung nicht verfügbar');
            return;
        }

        const statuses = ['', 'homeoffice', 'buero', 'urlaub', 'az'];

        try {
            const [year, month] = dateKey.split('-');
            const monthKey = `${year}-${month}`;

            // Get current status
            const snapshot = await this.database.ref(`plans/${this.currentUser.id}/${monthKey}/${dateKey}`).once('value');
            const currentStatus = snapshot.val() || '';

            // Find next status
            const currentIndex = statuses.indexOf(currentStatus);
            const nextIndex = (currentIndex + 1) % statuses.length;
            const nextStatus = statuses[nextIndex];

            // Update in Firebase
            if (nextStatus === '') {
                await this.database.ref(`plans/${this.currentUser.id}/${monthKey}/${dateKey}`).remove();
            } else {
                await this.database.ref(`plans/${this.currentUser.id}/${monthKey}/${dateKey}`).set(nextStatus);
            }

            // Refresh calendar and quota
            this.renderCalendar();
            this.updateQuotaDisplay();

        } catch (error) {
            console.error('Fehler beim Aktualisieren des Status:', error);
            this.showError('Fehler beim Speichern');
        }
    }

    changeMonth(direction) {
        this.viewDate.setMonth(this.viewDate.getMonth() + direction);
        this.renderCalendar();
        this.updateQuotaDisplay();
    }

    async updateQuotaDisplay() {
        if (!this.isFirebaseEnabled || this.currentUser.role === 'teamleader') {
            return;
        }

        try {
            const year = this.viewDate.getFullYear();
            const month = String(this.viewDate.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;

            const snapshot = await this.database.ref(`plans/${this.currentUser.id}/${monthKey}`).once('value');
            const plans = snapshot.val() || {};

            // Count working days and home office days
            const workingDays = Object.values(plans).filter(status =>
                status === 'homeoffice' || status === 'buero'
            ).length;

            const homeOfficeDays = Object.values(plans).filter(status =>
                status === 'homeoffice'
            ).length;

            const currentQuota = workingDays > 0 ? Math.round((homeOfficeDays / workingDays) * 100) : 0;
            const quotaElement = document.getElementById('quotaValue');

            quotaElement.textContent = `${currentQuota}%`;

            // Color coding based on quota limit
            const maxQuota = parseInt(document.getElementById('quotaSelect').value);
            if (currentQuota > maxQuota) {
                quotaElement.style.color = '#DC3545'; // Red
            } else if (currentQuota > maxQuota * 0.8) {
                quotaElement.style.color = '#FFC107'; // Yellow
            } else {
                quotaElement.style.color = '#28A745'; // Green
            }

        } catch (error) {
            console.error('Fehler beim Aktualisieren der Quote:', error);
        }
    }

    async updateQuota(newQuota) {
        this.currentUser.quota = parseInt(newQuota);

        // Save to Firebase if not teamleader
        if (this.isFirebaseEnabled && this.currentUser.role !== 'teamleader') {
            try {
                await this.database.ref(`users/${this.currentUser.id}/profile/quota`).set(this.currentUser.quota);
            } catch (error) {
                console.error('Fehler beim Speichern der Quote:', error);
            }
        }

        this.updateQuotaDisplay();
    }

    async renderTeamOverview() {
        if (!this.isFirebaseEnabled) {
            this.showError('Firebase-Verbindung nicht verfügbar');
            return;
        }

        const teamGrid = document.getElementById('teamGrid');
        teamGrid.innerHTML = '';

        try {
            const usersSnapshot = await this.database.ref('users').once('value');
            const users = usersSnapshot.val() || {};

            for (const userId of Object.keys(users)) {
                const user = users[userId];
                if (!user.profile || user.profile.role !== 'employee') continue;

                const memberDiv = document.createElement('div');
                memberDiv.className = 'team-member';

                // Get user's current month plans
                const year = this.viewDate.getFullYear();
                const month = String(this.viewDate.getMonth() + 1).padStart(2, '0');
                const monthKey = `${year}-${month}`;

                const plansSnapshot = await this.database.ref(`plans/${userId}/${monthKey}`).once('value');
                const plans = plansSnapshot.val() || {};

                // Calculate quota
                const workingDays = Object.values(plans).filter(status =>
                    status === 'homeoffice' || status === 'buero'
                ).length;

                const homeOfficeDays = Object.values(plans).filter(status =>
                    status === 'homeoffice'
                ).length;

                const quota = workingDays > 0 ? Math.round((homeOfficeDays / workingDays) * 100) : 0;

                memberDiv.innerHTML = `
                    <div class="team-member-header">
                        <h4 class="team-member-name">${user.profile.name}</h4>
                        ${this.currentUser.role === 'teamleader' ? `<span class="team-member-quota">${quota}%</span>` : ''}
                    </div>
                    <div class="team-member-calendar" id="team-calendar-${userId}"></div>
                `;

                teamGrid.appendChild(memberDiv);

                // Render mini calendar for this user
                this.renderMiniCalendar(userId, plans);
            }

        } catch (error) {
            console.error('Fehler beim Laden der Team-Übersicht:', error);
            this.showError('Fehler beim Laden der Team-Übersicht');
        }
    }

    renderMiniCalendar(userId, plans) {
        const container = document.getElementById(`team-calendar-${userId}`);
        if (!container) return;

        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(7, 1fr)';
        container.style.gap = '2px';
        container.style.fontSize = '12px';

        // Add day headers
        const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.textAlign = 'center';
            header.style.fontWeight = 'bold';
            header.style.padding = '2px';
            header.style.backgroundColor = '#f5f5f5';
            container.appendChild(header);
        });

        // Get first day of month
        const firstDay = new Date(year, month, 1);
        const startPadding = (firstDay.getDay() + 6) % 7;

        // Add empty cells for padding
        for (let i = 0; i < startPadding; i++) {
            const emptyCell = document.createElement('div');
            container.appendChild(emptyCell);
        }

        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            dayElement.style.textAlign = 'center';
            dayElement.style.padding = '4px 2px';
            dayElement.style.border = '1px solid #eee';
            dayElement.style.borderRadius = '2px';
            dayElement.style.minHeight = '24px';
            dayElement.style.display = 'flex';
            dayElement.style.alignItems = 'center';
            dayElement.style.justifyContent = 'center';

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = plans[dateKey];

            if (status) {
                const colors = {
                    homeoffice: '#FF8C00',
                    buero: '#4169E1',
                    urlaub: '#32CD32',
                    az: '#808080'
                };
                dayElement.style.backgroundColor = colors[status] || '#ccc';
                dayElement.style.color = 'white';
                dayElement.style.fontWeight = 'bold';
            }

            container.appendChild(dayElement);
        }
    }

    // Password modal methods
    showPasswordModal() {
        document.getElementById('passwordModal').classList.remove('hidden');
    }

    hidePasswordModal() {
        document.getElementById('passwordModal').classList.add('hidden');
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    async saveNewPassword() {
        const currentPw = document.getElementById('currentPassword').value;
        const newPw = document.getElementById('newPassword').value;
        const confirmPw = document.getElementById('confirmPassword').value;

        if (!currentPw || !newPw || !confirmPw) {
            this.showError('Bitte füllen Sie alle Felder aus');
            return;
        }

        if (newPw !== confirmPw) {
            this.showError('Neue Passwörter stimmen nicht überein');
            return;
        }

        if (!this.isFirebaseEnabled) {
            this.showError('Firebase-Verbindung nicht verfügbar');
            return;
        }

        try {
            // Verify current password
            const currentHash = await this.hashPassword(currentPw);
            const snapshot = await this.database.ref(`users/${this.currentUser.id}/profile/passwordHash`).once('value');
            const storedHash = snapshot.val();

            if (currentHash !== storedHash) {
                this.showError('Aktuelles Passwort falsch');
                return;
            }

            // Save new password
            const newHash = await this.hashPassword(newPw);
            await this.database.ref(`users/${this.currentUser.id}/profile/passwordHash`).set(newHash);

            this.hidePasswordModal();
            this.showError('Passwort erfolgreich geändert', 'success');

        } catch (error) {
            console.error('Fehler beim Ändern des Passworts:', error);
            this.showError('Fehler beim Ändern des Passworts');
        }
    }

    // Account deletion
    async deleteAccount() {
        if (!confirm('Möchten Sie Ihr Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        if (!this.isFirebaseEnabled) {
            this.showError('Firebase-Verbindung nicht verfügbar');
            return;
        }

        try {
            await this.database.ref(`users/${this.currentUser.id}`).remove();
            await this.database.ref(`plans/${this.currentUser.id}`).remove();

            this.logout();
            this.showError('Konto wurde gelöscht', 'success');

        } catch (error) {
            console.error('Fehler beim Löschen des Kontos:', error);
            this.showError('Fehler beim Löschen des Kontos');
        }
    }

    // Logout
    logout() {
        // Clean up listeners
        this.dataListeners.forEach((listener, path) => {
            if (this.database && listener.off) {
                listener.off();
            }
        });
        this.dataListeners.clear();

        this.currentUser = null;
        this.viewDate = new Date();

        // Reset forms
        document.getElementById('employeeSelect').value = '';
        document.getElementById('employeePassword').value = '';
        document.getElementById('teamleaderPassword').value = '';
        document.getElementById('newEmployeeName').value = '';
        document.getElementById('newEmployeePassword').value = '';
        document.getElementById('newEmployeePasswordConfirm').value = '';

        // Show login screen
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboardScreen').classList.add('hidden');
        document.getElementById('teamOverviewScreen').classList.add('hidden');

        this.showLoginTypeSelection();
        this.hideError();

        // Reload employees
        this.loadEmployees();
    }

    // Utility methods
    showError(message, type = 'error') {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.className = type === 'success' ? 'success-message' : 'error-message';
        errorElement.classList.remove('hidden');

        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homeOfficePlanner = new HomeOfficePlanner();
});