// HomeOffice-Planer - Complete Functionality with Original Design
class HomeOfficePlanner {
    constructor() {
        // Firebase Configuration
        this.firebaseConfig = {
            apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
            authDomain: "homeoffice-planer-drv.firebaseapp.com",
            databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "homeoffice-planer-drv",
            storageBucket: "homeoffice-planer-drv.firebasestorage.app",
            messagingSenderId: "669565818222",
            appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
        };

        // App state
        this.currentUser = null;
        this.currentDate = new Date();
        this.viewDate = new Date();
        this.database = null;
        this.isFirebaseEnabled = false;

        // Holidays 2025-2030
        this.holidays = {
            "2025": ["2025-01-01", "2025-04-18", "2025-04-21", "2025-05-01", "2025-05-29", "2025-06-09", "2025-06-19", "2025-08-15", "2025-10-03", "2025-11-01", "2025-12-25", "2025-12-26"],
            "2026": ["2026-01-01", "2026-04-03", "2026-04-06", "2026-05-01", "2026-05-14", "2026-05-25", "2026-06-04", "2026-08-15", "2026-10-03", "2026-11-01", "2026-12-25", "2026-12-26"],
            "2027": ["2027-01-01", "2027-03-26", "2027-03-29", "2027-05-01", "2027-05-06", "2027-05-17", "2027-05-27", "2027-08-15", "2027-10-03", "2027-11-01", "2027-12-25", "2027-12-26"],
            "2028": ["2028-01-01", "2028-04-14", "2028-04-17", "2028-05-01", "2028-05-25", "2028-06-05", "2028-06-15", "2028-08-15", "2028-10-03", "2028-11-01", "2028-12-25", "2028-12-26"],
            "2029": ["2029-01-01", "2029-03-30", "2029-04-02", "2029-05-01", "2029-05-10", "2029-05-21", "2029-05-31", "2029-08-15", "2029-10-03", "2029-11-01", "2029-12-25", "2029-12-26"],
            "2030": ["2030-01-01", "2030-04-19", "2030-04-22", "2030-05-01", "2030-05-30", "2030-06-10", "2030-06-20", "2030-08-15", "2030-10-03", "2030-11-01", "2030-12-25", "2030-12-26"]
        };

        this.init();
    }

    init() {
        console.log('🚀 HomeOffice-Planer wird initialisiert...');
        this.initFirebase();
        this.setupEventListeners();
        this.registerServiceWorker();
        this.loadEmployees();
        console.log('✅ HomeOffice-Planer erfolgreich initialisiert');
    }

    async initFirebase() {
        try {
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(this.firebaseConfig);
                this.database = firebase.database();
                this.isFirebaseEnabled = true;
                console.log('✅ Firebase initialisiert');
            }
        } catch (error) {
            console.warn('⚠️ Firebase nicht verfügbar, Demo-Modus aktiviert');
        }
    }

    setupEventListeners() {
        // Login type selection
        document.getElementById('employeeBtn').addEventListener('click', () => this.showEmployeeForm());
        document.getElementById('teamleaderBtn').addEventListener('click', () => this.showTeamleaderForm());
        document.getElementById('newEmployeeBtn').addEventListener('click', () => this.showNewEmployeeForm());

        // Back buttons
        document.getElementById('employeeBackBtn').addEventListener('click', () => this.showLoginTypeSelection());
        document.getElementById('teamleaderBackBtn').addEventListener('click', () => this.showLoginTypeSelection());
        document.getElementById('newEmployeeBackBtn').addEventListener('click', () => this.showLoginTypeSelection());

        // Login buttons
        document.getElementById('employeeLoginBtn').addEventListener('click', () => this.handleEmployeeLogin());
        document.getElementById('teamleaderLoginBtn').addEventListener('click', () => this.handleTeamleaderLogin());
        document.getElementById('newEmployeeRegisterBtn').addEventListener('click', () => this.handleNewEmployeeRegister());

        // Dashboard controls
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('quotaSelect').addEventListener('change', (e) => this.updateQuota(e.target.value));
        document.getElementById('prevMonthBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.changeMonth(1));

        // Action buttons
        document.getElementById('teamOverviewBtn').addEventListener('click', () => this.showTeamOverview());
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.showPasswordModal());
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.deleteAccount());
        document.getElementById('backToDashboardBtn').addEventListener('click', () => this.showDashboard());

        // Password modal
        document.getElementById('savePasswordBtn').addEventListener('click', () => this.savePassword());
        document.getElementById('cancelPasswordBtn').addEventListener('click', () => this.hidePasswordModal());

        // Enter key support
        document.getElementById('employeePassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEmployeeLogin();
        });
        document.getElementById('teamleaderPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleTeamleaderLogin();
        });
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('service-worker.js');
                console.log('✅ Service Worker registriert');
            } catch (error) {
                console.log('❌ Service Worker Registrierung fehlgeschlagen');
            }
        }
    }

    // UI Navigation Methods
    showLoginTypeSelection() {
        document.getElementById('loginTypeSelection').classList.remove('hidden');
        document.getElementById('employeeForm').classList.add('hidden');
        document.getElementById('teamleaderForm').classList.add('hidden');
        document.getElementById('newEmployeeForm').classList.add('hidden');
        this.hideError();
    }

    showEmployeeForm() {
        document.getElementById('loginTypeSelection').classList.add('hidden');
        document.getElementById('employeeForm').classList.remove('hidden');
        document.getElementById('employeeSelect').focus();
    }

    showTeamleaderForm() {
        document.getElementById('loginTypeSelection').classList.add('hidden');
        document.getElementById('teamleaderForm').classList.remove('hidden');
        document.getElementById('teamleaderPassword').focus();
    }

    showNewEmployeeForm() {
        document.getElementById('loginTypeSelection').classList.add('hidden');
        document.getElementById('newEmployeeForm').classList.remove('hidden');
        document.getElementById('newEmployeeName').focus();
    }

    showDashboard() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        document.getElementById('teamOverviewSection').classList.add('hidden');
        
        document.getElementById('welcomeMessage').textContent = `Willkommen, ${this.currentUser.name}`;
        document.getElementById('quotaSelect').value = this.currentUser.quota;
        
        this.renderCalendar();
        this.updateQuotaDisplay();
    }

    showTeamOverview() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('teamOverviewSection').classList.remove('hidden');
        
        this.renderTeamOverview();
    }

    showPasswordModal() {
        document.getElementById('passwordModal').classList.remove('hidden');
    }

    hidePasswordModal() {
        document.getElementById('passwordModal').classList.add('hidden');
        document.getElementById('currentPasswordInput').value = '';
        document.getElementById('newPasswordInput').value = '';
        document.getElementById('confirmPasswordInput').value = '';
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

            if (!profile || profile.passwordHash !== hashedPassword) {
                this.showError('Name oder Passwort falsch');
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
        const confirm = document.getElementById('newEmployeeConfirm').value;

        if (!name || !password || !confirm) {
            this.showError('Bitte füllen Sie alle Felder aus');
            return;
        }

        if (password !== confirm) {
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

            // Check if user exists
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
            header.className = 'calendar-day calendar-day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        // Get first day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() + 6) % 7);

        // Load user plans
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
                day.classList.add('calendar-day-other-month');
            } else {
                // Check if holiday
                const holidayYear = cellDate.getFullYear().toString();
                const isHoliday = this.holidays[holidayYear]?.includes(dateKey);

                if (isHoliday) {
                    day.classList.add('calendar-day-disabled');
                } else {
                    // Check if today
                    const today = new Date();
                    if (cellDate.toDateString() === today.toDateString()) {
                        day.classList.add('calendar-day-today');
                    }

                    // Check if has status
                    if (userPlans[dateKey]) {
                        day.classList.add(`calendar-day-${userPlans[dateKey]}`);
                        const symbols = {
                            homeoffice: '🏠',
                            buero: '🏢',
                            urlaub: '🏖️',
                            az: '⏰'
                        };
                        day.textContent = `${cellDate.getDate()} ${symbols[userPlans[dateKey]] || ''}`;
                    }

                    // Add click handler
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

            // Refresh calendar
            this.renderCalendar();
            this.updateQuotaDisplay();

        } catch (error) {
            console.error('Fehler beim Aktualisieren:', error);
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

            const workingDays = Object.values(plans).filter(status =>
                status === 'homeoffice' || status === 'buero'
            ).length;

            const homeOfficeDays = Object.values(plans).filter(status =>
                status === 'homeoffice'
            ).length;

            const currentQuota = workingDays > 0 ? Math.round((homeOfficeDays / workingDays) * 100) : 0;
            const quotaElement = document.getElementById('quotaValue');

            quotaElement.textContent = `${currentQuota}%`;

            // Color coding
            const maxQuota = parseInt(document.getElementById('quotaSelect').value);
            if (currentQuota > maxQuota) {
                quotaElement.style.color = '#e53e3e';
            } else if (currentQuota > maxQuota * 0.8) {
                quotaElement.style.color = '#FF8C00';
            } else {
                quotaElement.style.color = '#217A8D';
            }

        } catch (error) {
            console.error('Fehler bei Quote-Berechnung:', error);
        }
    }

    async updateQuota(newQuota) {
        this.currentUser.quota = parseInt(newQuota);

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

                // Get user's plans
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
                this.renderMiniCalendar(userId, plans);
            }

        } catch (error) {
            console.error('Fehler beim Laden der Team-Übersicht:', error);
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

        // Day headers
        const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.cssText = 'text-align:center;font-weight:bold;padding:2px;background:#e2e8f0;';
            container.appendChild(header);
        });

        // First day padding
        const firstDay = new Date(year, month, 1);
        const startPadding = (firstDay.getDay() + 6) % 7;

        for (let i = 0; i < startPadding; i++) {
            container.appendChild(document.createElement('div'));
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            dayElement.style.cssText = 'text-align:center;padding:4px 2px;border:1px solid #eee;min-height:24px;display:flex;align-items:center;justify-content:center;';

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = plans[dateKey];

            if (status) {
                const colors = {
                    homeoffice: '#FF8C00',
                    buero: '#4169E1',
                    urlaub: '#32CD32',
                    az: '#718096'
                };
                dayElement.style.backgroundColor = colors[status];
                dayElement.style.color = 'white';
                dayElement.style.fontWeight = 'bold';
            }

            container.appendChild(dayElement);
        }
    }

    async savePassword() {
        const currentPw = document.getElementById('currentPasswordInput').value;
        const newPw = document.getElementById('newPasswordInput').value;
        const confirmPw = document.getElementById('confirmPasswordInput').value;

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
            const currentHash = await this.hashPassword(currentPw);
            const snapshot = await this.database.ref(`users/${this.currentUser.id}/profile/passwordHash`).once('value');

            if (currentHash !== snapshot.val()) {
                this.showError('Aktuelles Passwort falsch');
                return;
            }

            const newHash = await this.hashPassword(newPw);
            await this.database.ref(`users/${this.currentUser.id}/profile/passwordHash`).set(newHash);

            this.hidePasswordModal();
            this.showError('Passwort erfolgreich geändert', 'success');
        } catch (error) {
            console.error('Fehler beim Ändern des Passworts:', error);
            this.showError('Fehler beim Ändern des Passworts');
        }
    }

    async deleteAccount() {
        if (!confirm('Möchten Sie Ihr Konto wirklich löschen?')) return;

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
            console.error('Fehler beim Löschen:', error);
            this.showError('Fehler beim Löschen des Kontos');
        }
    }

    logout() {
        this.currentUser = null;
        this.viewDate = new Date();

        // Clear forms
        document.getElementById('employeeSelect').value = '';
        document.getElementById('employeePassword').value = '';
        document.getElementById('teamleaderPassword').value = '';
        document.getElementById('newEmployeeName').value = '';
        document.getElementById('newEmployeePassword').value = '';
        document.getElementById('newEmployeeConfirm').value = '';

        // Show login
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('teamOverviewSection').classList.add('hidden');

        this.showLoginTypeSelection();
        this.hideError();
        this.loadEmployees();
    }

    showError(message, type = 'error') {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.className = type === 'success' ? 'success-message' : 'error-message';
        errorElement.classList.remove('hidden');

        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homeOfficePlanner = new HomeOfficePlanner();
});