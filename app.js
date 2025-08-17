// HomeOffice Planer - KORRIGIERTE Version mit funktionierendem Login
class HomeOfficePlanner {
    constructor() {
        // Feiertage Saarland 2025-2030 aus den bereitgestellten Daten
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

        this.statusTypes = {
            "homeoffice": {"name": "Home-Office", "color": "#FF8C00", "symbol": "🏠"},
            "buero": {"name": "Büro", "color": "#4169E1", "symbol": "🏢"},
            "urlaub": {"name": "Urlaub", "color": "#32CD32", "symbol": "🏖️"},
            "az": {"name": "AZ", "color": "#808080", "symbol": "⏰"}
        };

        // Authentifizierung und Benutzer-System
        this.userAuth = {}; // username -> hashedPassword
        this.userQuotas = {}; // username -> quota (40 or 60)
        this.currentUser = null;
        this.userRole = null; // 'colleague' or 'teamleader'
        this.isLoggedIn = false;

        // Teamleiter-Passwort (KORRIGIERT)
        this.teamleaderPassword = "teamleiter123";
        this.resetPasswordDefault = "NeuesPasswort123";

        // App-Zustand
        this.colleagues = ["Torsten", "Anna", "Michael", "Sarah", "Thomas"];
        this.currentDate = new Date();
        this.planningData = {}; // username -> date -> status
        this.selectedDateForStatus = null;
        this.currentView = 'personal'; // 'personal', 'teamleader', 'team'
        this.selectedColleague = null;

        this.init();
    }

    async init() {
        console.log('Initializing HomeOfficePlanner...');
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }
            
            // Initiale Passwörter für bestehende Kollegen (Demo-Zwecke)
            await this.initializeDemoUsers();
            
            // Setup event listeners BEFORE showing login screen
            this.setupEventListeners();
            
            // Now show login screen
            this.showLoginScreen();
            
            console.log('HomeOfficePlanner initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    async initializeDemoUsers() {
        // Demo-Passwörter für bestehende Kollegen (alle verwenden "password123")
        const demoPassword = "password123";
        const hashedDemo = await this.hashPassword(demoPassword);
        
        for (const colleague of this.colleagues) {
            this.userAuth[colleague] = hashedDemo;
            this.userQuotas[colleague] = 40; // Standard-Quote 40%
            this.planningData[colleague] = {};
        }

        console.log('Demo users initialized. Login with any of:', this.colleagues.join(', '), 'using password: password123');
        console.log('Teamleader password: teamleiter123');
    }

    // SHA-256 Hash-Funktion
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    showLoginScreen() {
        console.log('Showing login screen...');
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            loginScreen.classList.remove('hidden');
        }
        if (appContainer) appContainer.classList.add('hidden');
        
        this.isLoggedIn = false;
        this.currentUser = null;
        this.userRole = null;
        this.currentView = 'personal';
        
        // Always populate dropdown when showing login screen
        this.populateColleagueDropdown();
        this.showRoleSelection();
    }

    showRoleSelection() {
        console.log('Showing role selection...');
        // Hide all forms and show role selection
        this.hideAllLoginForms();
        const roleSelection = document.getElementById('roleSelection');
        if (roleSelection) {
            roleSelection.style.display = 'block';
            roleSelection.classList.remove('hidden');
        }
    }

    hideAllLoginForms() {
        const roleSelection = document.getElementById('roleSelection');
        const colleagueForm = document.getElementById('colleagueLoginForm');
        const teamleaderForm = document.getElementById('teamleaderLoginForm');
        const newColleagueForm = document.getElementById('newColleagueForm');

        if (roleSelection) roleSelection.style.display = 'none';
        if (colleagueForm) colleagueForm.classList.add('hidden');
        if (teamleaderForm) teamleaderForm.classList.add('hidden');
        if (newColleagueForm) newColleagueForm.classList.add('hidden');
    }

    populateColleagueDropdown() {
        const dropdown = document.getElementById('colleagueUsername');
        if (!dropdown) {
            console.error('Dropdown not found');
            return;
        }

        // Clear existing options
        dropdown.innerHTML = '<option value="">Name auswählen</option>';

        // Add all colleagues
        const allColleagues = Object.keys(this.userAuth).filter(name => name !== 'Teamleiter').sort();
        allColleagues.forEach(colleague => {
            const option = document.createElement('option');
            option.value = colleague;
            option.textContent = colleague;
            dropdown.appendChild(option);
        });
        
        console.log('Dropdown populated with colleagues:', allColleagues);
    }

    showMainApp() {
        console.log('Showing main app...');
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
            loginScreen.classList.add('hidden');
        }
        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.style.display = 'block';
        }
        
        this.updateCurrentMonth();
        this.updateUserInfo();
        this.updateControlButtons();
        
        // WICHTIG: Kollegen starten immer mit ihrer eigenen Kalenderansicht
        if (this.userRole === 'colleague') {
            this.showPersonalView();
        } else {
            this.showTeamleaderDashboard();
        }
    }

    updateUserInfo() {
        const currentUserName = document.getElementById('currentUserName');
        const userRole = document.getElementById('userRole');
        
        if (currentUserName && this.currentUser) {
            currentUserName.textContent = this.currentUser;
        }
        
        if (userRole) {
            userRole.textContent = this.userRole === 'teamleader' ? 'Teamleiter' : 'Kollege';
        }
    }

    updateControlButtons() {
        const teamViewBtn = document.getElementById('teamViewBtn');
        const personalViewBtn = document.getElementById('personalViewBtn');
        const teamleaderViewBtn = document.getElementById('teamleaderViewBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');

        // Reset all buttons
        [teamViewBtn, personalViewBtn, teamleaderViewBtn, changePasswordBtn, deleteAccountBtn].forEach(btn => {
            if (btn) btn.classList.add('hidden');
        });

        if (this.userRole === 'teamleader') {
            // Teamleiter sieht Team-View und Teamleiter-Dashboard
            if (teamViewBtn) teamViewBtn.classList.remove('hidden');
            if (teamleaderViewBtn) teamleaderViewBtn.classList.remove('hidden');
        } else {
            // Normale Kollegen sehen Team-Übersicht, Passwort ändern und Konto löschen
            if (teamViewBtn) teamViewBtn.classList.remove('hidden');
            if (changePasswordBtn) changePasswordBtn.classList.remove('hidden');
            if (deleteAccountBtn) deleteAccountBtn.classList.remove('hidden');
        }

        // Show personal view button when not in personal view
        if (this.currentView !== 'personal' && personalViewBtn && this.userRole === 'colleague') {
            personalViewBtn.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Role Selection Buttons
        const colleagueRoleBtn = document.getElementById('colleagueRoleBtn');
        const teamleaderRoleBtn = document.getElementById('teamleaderRoleBtn');
        const newColleagueRoleBtn = document.getElementById('newColleagueRoleBtn');

        if (colleagueRoleBtn) {
            colleagueRoleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Colleague role button clicked');
                this.showColleagueLogin();
            });
        } else {
            console.error('colleagueRoleBtn not found');
        }
        
        if (teamleaderRoleBtn) {
            teamleaderRoleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Teamleader role button clicked');
                this.showTeamleaderLogin();
            });
        }
        
        if (newColleagueRoleBtn) {
            newColleagueRoleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('New colleague role button clicked');
                this.showNewColleagueForm();
            });
        }

        // Back buttons
        const backFromColleagueLogin = document.getElementById('backFromColleagueLogin');
        const backFromTeamleaderLogin = document.getElementById('backFromTeamleaderLogin');
        const backFromNewColleague = document.getElementById('backFromNewColleague');

        if (backFromColleagueLogin) {
            backFromColleagueLogin.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Back from colleague login clicked');
                this.showRoleSelection();
            });
        }

        if (backFromTeamleaderLogin) {
            backFromTeamleaderLogin.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Back from teamleader login clicked');
                this.showRoleSelection();
            });
        }

        if (backFromNewColleague) {
            backFromNewColleague.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Back from new colleague clicked');
                this.showRoleSelection();
            });
        }

        // Login Forms
        const colleagueLoginForm = document.getElementById('colleagueLoginForm');
        const teamleaderLoginForm = document.getElementById('teamleaderLoginForm');
        const newColleagueForm = document.getElementById('newColleagueForm');

        if (colleagueLoginForm) {
            colleagueLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Colleague login form submitted');
                await this.handleColleagueLogin();
            });
        } else {
            console.error('colleagueLoginForm not found');
        }

        if (teamleaderLoginForm) {
            teamleaderLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Teamleader login form submitted');
                await this.handleTeamleaderLogin();
            });
        }

        if (newColleagueForm) {
            newColleagueForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('New colleague form submitted');
                await this.handleNewColleagueRegistration();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Logout button clicked');
                this.handleLogout();
            });
        }

        // Navigation
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateMonth(1));

        // Quota Selector (only for personal view)
        const quotaSelect = document.getElementById('quotaSelect');
        if (quotaSelect) {
            quotaSelect.addEventListener('change', (e) => {
                this.handleQuotaChange(parseInt(e.target.value));
            });
        }

        // Teamleader Filter
        const teamleaderFilter = document.getElementById('teamleaderFilter');
        if (teamleaderFilter) {
            teamleaderFilter.addEventListener('change', (e) => {
                this.updateTeamleaderDashboard();
            });
        }

        // View Controls
        const teamViewBtn = document.getElementById('teamViewBtn');
        const personalViewBtn = document.getElementById('personalViewBtn');
        const teamleaderViewBtn = document.getElementById('teamleaderViewBtn');
        const backFromTeamView = document.getElementById('backFromTeamView');

        if (teamViewBtn) {
            teamViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Team view button clicked');
                this.showTeamOverview();
            });
        }

        if (personalViewBtn) {
            personalViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Personal view button clicked');
                this.showPersonalView();
            });
        }

        if (teamleaderViewBtn) {
            teamleaderViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Teamleader view button clicked');
                this.showTeamleaderDashboard();
            });
        }

        if (backFromTeamView) {
            backFromTeamView.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Back from team view clicked');
                if (this.userRole === 'teamleader') {
                    this.showTeamleaderDashboard();
                } else {
                    this.showPersonalView();
                }
            });
        }

        // Password and Account Management
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            });
        }

        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeleteAccountModal();
            });
        }

        // Status Modal
        const cancelStatusBtn = document.getElementById('cancelStatusChange');
        if (cancelStatusBtn) {
            cancelStatusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideStatusModal();
            });
        }

        // Status Buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const status = e.currentTarget.dataset.status;
                this.setStatus(status);
            });
        });

        // Password Change Modal
        const changePasswordForm = document.getElementById('changePasswordForm');
        const cancelPasswordChange = document.getElementById('cancelPasswordChange');

        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange();
            });
        }

        if (cancelPasswordChange) {
            cancelPasswordChange.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideChangePasswordModal();
            });
        }

        // Delete Account Modal
        const confirmDeleteAccount = document.getElementById('confirmDeleteAccount');
        const cancelDeleteAccount = document.getElementById('cancelDeleteAccount');

        if (confirmDeleteAccount) {
            confirmDeleteAccount.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDeleteAccount();
            });
        }

        if (cancelDeleteAccount) {
            cancelDeleteAccount.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideDeleteAccountModal();
            });
        }

        // Colleague Detail Modal (Teamleader)
        const cancelColleagueDetail = document.getElementById('cancelColleagueDetail');
        const resetColleaguePassword = document.getElementById('resetColleaguePassword');
        const deleteColleague = document.getElementById('deleteColleague');

        if (cancelColleagueDetail) {
            cancelColleagueDetail.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideColleagueDetailModal();
            });
        }

        if (resetColleaguePassword) {
            resetColleaguePassword.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleResetColleaguePassword();
            });
        }

        if (deleteColleague) {
            deleteColleague.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeleteColleagueModal();
            });
        }

        // Delete Colleague Modal (Teamleader)
        const confirmDeleteColleague = document.getElementById('confirmDeleteColleague');
        const cancelDeleteColleague = document.getElementById('cancelDeleteColleague');

        if (confirmDeleteColleague) {
            confirmDeleteColleague.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDeleteColleague();
            });
        }

        if (cancelDeleteColleague) {
            cancelDeleteColleague.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideDeleteColleagueModal();
            });
        }

        // Modal Overlays
        document.querySelectorAll('.modal__overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAllModals();
                }
            });
        });

        console.log('Event listeners setup completed');
    }

    showColleagueLogin() {
        console.log('Showing colleague login form...');
        this.hideAllLoginForms();
        const form = document.getElementById('colleagueLoginForm');
        if (form) {
            form.classList.remove('hidden');
            form.style.display = 'flex';
            
            // Re-populate dropdown to ensure it's ready
            this.populateColleagueDropdown();
            
            const usernameInput = document.getElementById('colleagueUsername');
            if (usernameInput) {
                setTimeout(() => usernameInput.focus(), 100);
            }
        }
    }

    showTeamleaderLogin() {
        console.log('Showing teamleader login form...');
        this.hideAllLoginForms();
        const form = document.getElementById('teamleaderLoginForm');
        if (form) {
            form.classList.remove('hidden');
            form.style.display = 'flex';
            const passwordInput = document.getElementById('teamleaderPassword');
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 100);
            }
        }
    }

    showNewColleagueForm() {
        console.log('Showing new colleague form...');
        this.hideAllLoginForms();
        const form = document.getElementById('newColleagueForm');
        if (form) {
            form.classList.remove('hidden');
            form.style.display = 'flex';
            const nameInput = document.getElementById('newColleagueName');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        }
    }

    async handleColleagueLogin() {
        const usernameSelect = document.getElementById('colleagueUsername');
        const passwordInput = document.getElementById('colleaguePassword');
        
        if (!usernameSelect || !passwordInput) {
            console.error('Login form elements not found');
            alert('Fehler: Login-Formular nicht gefunden!');
            return;
        }
        
        const username = usernameSelect.value.trim();
        const password = passwordInput.value;
        
        console.log('Attempting colleague login for:', username);
        
        if (!username || !password) {
            alert('Bitte Namen und Passwort eingeben!');
            return;
        }

        try {
            const hashedPassword = await this.hashPassword(password);
            
            if (this.userAuth[username] === hashedPassword) {
                this.currentUser = username;
                this.userRole = 'colleague';
                this.isLoggedIn = true;
                
                // Set user's quota
                const quotaSelect = document.getElementById('quotaSelect');
                if (quotaSelect && this.userQuotas[username]) {
                    quotaSelect.value = this.userQuotas[username];
                }
                
                // Clear form
                usernameSelect.value = '';
                passwordInput.value = '';
                
                this.showMainApp();
                console.log(`Colleague ${username} logged in successfully`);
            } else {
                alert('Benutzername oder Passwort falsch!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Fehler beim Anmelden. Bitte versuchen Sie es erneut.');
        }
    }

    async handleTeamleaderLogin() {
        const passwordInput = document.getElementById('teamleaderPassword');
        
        if (!passwordInput) {
            console.error('Teamleader password input not found');
            alert('Fehler: Login-Formular nicht gefunden!');
            return;
        }
        
        const password = passwordInput.value;
        
        console.log('Attempting teamleader login...');
        
        if (!password) {
            alert('Bitte Teamleiter-Passwort eingeben!');
            return;
        }

        if (password === this.teamleaderPassword) {
            this.currentUser = 'Teamleiter';
            this.userRole = 'teamleader';
            this.isLoggedIn = true;
            
            // Clear form
            passwordInput.value = '';
            
            this.showMainApp();
            console.log('Teamleader logged in successfully');
        } else {
            alert('Teamleiter-Passwort falsch!');
        }
    }

    async handleNewColleagueRegistration() {
        const nameInput = document.getElementById('newColleagueName');
        const passwordInput = document.getElementById('newColleaguePassword');
        const confirmInput = document.getElementById('newColleagueConfirm');
        
        if (!nameInput || !passwordInput || !confirmInput) {
            console.error('Registration form elements not found');
            alert('Fehler: Registrierungs-Formular nicht gefunden!');
            return;
        }
        
        const name = nameInput.value.trim();
        const password = passwordInput.value;
        const confirmPass = confirmInput.value;
        
        console.log('Attempting new colleague registration for:', name);
        
        if (!name || !password || !confirmPass) {
            alert('Bitte alle Felder ausfüllen!');
            return;
        }
        
        if (password !== confirmPass) {
            alert('Passwörter stimmen nicht überein!');
            return;
        }
        
        if (password.length < 6) {
            alert('Passwort muss mindestens 6 Zeichen haben!');
            return;
        }
        
        if (this.userAuth[name]) {
            alert('Benutzername bereits vergeben!');
            return;
        }

        try {
            // Register new user
            const hashedPassword = await this.hashPassword(password);
            this.userAuth[name] = hashedPassword;
            this.userQuotas[name] = 40; // Standard-Quote
            this.planningData[name] = {};
            
            if (!this.colleagues.includes(name)) {
                this.colleagues.push(name);
            }
            
            // Clear form
            nameInput.value = '';
            passwordInput.value = '';
            confirmInput.value = '';
            
            // Update dropdown for future logins
            this.populateColleagueDropdown();
            
            // Auto login after registration
            this.currentUser = name;
            this.userRole = 'colleague';
            this.isLoggedIn = true;
            
            this.showMainApp();
            console.log(`New colleague registered and logged in: ${name}`);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Fehler bei der Registrierung. Bitte versuchen Sie es erneut.');
        }
    }

    handleLogout() {
        console.log('Logging out...');
        this.currentUser = null;
        this.userRole = null;
        this.isLoggedIn = false;
        this.currentView = 'personal';
        this.selectedColleague = null;
        this.showLoginScreen();
        console.log('User logged out');
    }

    showPersonalView() {
        console.log('Showing personal view for:', this.currentUser);
        
        // Teamleiter haben keine persönliche Sicht
        if (this.userRole === 'teamleader') {
            this.showTeamleaderDashboard();
            return;
        }
        
        this.currentView = 'personal';
        
        // Show/hide sections
        document.getElementById('personalDashboard').classList.remove('hidden');
        document.getElementById('teamleaderDashboard').classList.add('hidden');
        document.getElementById('teamView').classList.add('hidden');
        
        this.updateControlButtons();
        this.renderCalendar();
        this.updatePersonalDashboard();
    }

    showTeamleaderDashboard() {
        if (this.userRole !== 'teamleader') return;
        
        this.currentView = 'teamleader';
        
        // Show/hide sections
        document.getElementById('personalDashboard').classList.add('hidden');
        document.getElementById('teamleaderDashboard').classList.remove('hidden');
        document.getElementById('teamView').classList.add('hidden');
        
        this.updateControlButtons();
        this.renderCalendar();
        this.updateTeamleaderDashboard();
    }

    showTeamOverview() {
        console.log('Showing team overview...');
        this.currentView = 'team';
        
        // Show/hide sections
        document.getElementById('personalDashboard').classList.add('hidden');
        document.getElementById('teamleaderDashboard').classList.add('hidden');
        document.getElementById('teamView').classList.remove('hidden');
        
        this.updateControlButtons();
        this.renderTeamOverview();
        this.renderCalendar();
    }

    handleQuotaChange(newQuota) {
        if (!this.currentUser || this.userRole !== 'colleague') return;
        
        this.userQuotas[this.currentUser] = newQuota;
        
        // Update target display
        const statTarget = document.getElementById('statTarget');
        if (statTarget) {
            statTarget.textContent = `Ziel: ≤ ${newQuota}%`;
        }
        
        this.updatePersonalDashboard();
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateCurrentMonth();
        this.renderCalendar();
        
        if (this.currentView === 'personal') {
            this.updatePersonalDashboard();
        } else if (this.currentView === 'teamleader') {
            this.updateTeamleaderDashboard();
        } else if (this.currentView === 'team') {
            this.renderTeamOverview();
        }
    }

    updateCurrentMonth() {
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        const currentMonthSpan = document.getElementById('currentMonth');
        if (currentMonthSpan) {
            currentMonthSpan.textContent = 
                `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        const grid = calendar.querySelector('.calendar__grid');
        if (!grid) return;
        
        // Clear existing days
        const existingDays = grid.querySelectorAll('.calendar__day');
        existingDays.forEach(day => day.remove());

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        
        // Adjust to Monday start (German standard)
        const dayOfWeek = (firstDay.getDay() + 6) % 7;
        startDate.setDate(firstDay.getDate() - dayOfWeek);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 41); // 6 weeks

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayElement = this.createDayElement(currentDate, month);
            grid.appendChild(dayElement);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    createDayElement(date, currentMonth) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar__day';
        
        const dateStr = this.formatDate(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const holiday = this.getHoliday(dateStr);

        if (!isCurrentMonth) {
            dayDiv.classList.add('other-month');
        }
        if (isWeekend) {
            dayDiv.classList.add('weekend');
        }
        if (holiday) {
            dayDiv.classList.add('holiday');
        }

        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayDiv.appendChild(dayNumber);

        // Holiday name
        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday.name;
            dayDiv.appendChild(holidayName);
        }

        // KRITISCHER FIX: Kollegen MÜSSEN ihren eigenen Kalender klicken können
        if (isCurrentMonth && !holiday && !isWeekend) {
            if (this.currentView === 'team') {
                // Team view: show all colleague statuses (read-only)
                this.colleagues.forEach(colleague => {
                    const status = this.getStatus(colleague, dateStr);
                    if (status) {
                        const statusRow = document.createElement('div');
                        statusRow.className = 'team-status-row';
                        
                        const dot = document.createElement('div');
                        dot.className = `team-status-dot ${status}`;
                        
                        const nameSpan = document.createElement('span');
                        nameSpan.textContent = colleague.charAt(0);
                        nameSpan.style.fontSize = 'var(--font-size-xs)';
                        
                        statusRow.appendChild(dot);
                        statusRow.appendChild(nameSpan);
                        statusRow.title = `${colleague}: ${this.statusTypes[status].name}`;
                        
                        dayDiv.appendChild(statusRow);
                    }
                });
            } else if (this.currentView === 'personal' && this.userRole === 'colleague') {
                // WICHTIG: Personal view = Kollege kann IMMER seinen Kalender bearbeiten
                const status = this.getStatus(this.currentUser, dateStr);
                if (status) {
                    const statusDiv = document.createElement('div');
                    statusDiv.className = `day-status ${status}`;
                    statusDiv.textContent = `${this.statusTypes[status].symbol} ${this.statusTypes[status].name}`;
                    dayDiv.appendChild(statusDiv);
                }

                // WICHTIG: Immer klickbar in der persönlichen Ansicht
                dayDiv.classList.add('clickable');
                dayDiv.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Calendar day clicked:', dateStr);
                    this.showStatusModal(dateStr);
                });
            } else if (this.currentView === 'teamleader' && this.userRole === 'teamleader') {
                // Teamleader view: show overview of all statuses
                const statusSummary = {};
                this.colleagues.forEach(colleague => {
                    const status = this.getStatus(colleague, dateStr);
                    if (status) {
                        statusSummary[status] = (statusSummary[status] || 0) + 1;
                    }
                });

                Object.keys(statusSummary).forEach(status => {
                    const count = statusSummary[status];
                    const statusDiv = document.createElement('div');
                    statusDiv.className = `day-status ${status}`;
                    statusDiv.textContent = `${this.statusTypes[status].symbol} ${count}`;
                    statusDiv.title = `${this.statusTypes[status].name}: ${count} Kollege${count > 1 ? 'n' : ''}`;
                    dayDiv.appendChild(statusDiv);
                });
            }
        }

        return dayDiv;
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    getHoliday(dateStr) {
        const year = dateStr.split('-')[0];
        const holidays = this.holidays[year] || [];
        return holidays.find(h => h.datum === dateStr);
    }

    getStatus(colleague, date) {
        return this.planningData[colleague]?.[date];
    }

    setStatus(status) {
        console.log('Setting status:', status, 'for user:', this.currentUser, 'date:', this.selectedDateForStatus);
        
        if (!this.currentUser || this.userRole !== 'colleague' || !this.selectedDateForStatus) {
            console.log('Cannot set status: user not logged in or not colleague or no date selected');
            return;
        }

        if (status === 'clear') {
            if (this.planningData[this.currentUser]) {
                delete this.planningData[this.currentUser][this.selectedDateForStatus];
            }
        } else {
            if (!this.planningData[this.currentUser]) {
                this.planningData[this.currentUser] = {};
            }
            this.planningData[this.currentUser][this.selectedDateForStatus] = status;
        }

        this.hideStatusModal();
        this.renderCalendar();
        if (this.currentView === 'personal') {
            this.updatePersonalDashboard();
        }
        
        console.log('Status set successfully. Current planning data:', this.planningData[this.currentUser]);
    }

    showStatusModal(dateStr) {
        console.log('Showing status modal for date:', dateStr, 'user:', this.currentUser);
        
        if (!this.currentUser || this.userRole !== 'colleague') {
            console.log('Cannot show status modal: user not logged in or not colleague');
            return;
        }

        this.selectedDateForStatus = dateStr;
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const statusModalDate = document.getElementById('statusModalDate');
        const statusModal = document.getElementById('statusModal');
        
        if (statusModalDate) statusModalDate.textContent = formattedDate;
        if (statusModal) statusModal.classList.remove('hidden');
    }

    hideStatusModal() {
        const statusModal = document.getElementById('statusModal');
        if (statusModal) statusModal.classList.add('hidden');
        this.selectedDateForStatus = null;
    }

    showChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('oldPassword').focus();
        }
    }

    hideChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.classList.add('hidden');
        
        // Clear form
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }

    async handlePasswordChange() {
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (!oldPassword || !newPassword || !confirmPassword) {
            alert('Bitte alle Felder ausfüllen!');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Neue Passwörter stimmen nicht überein!');
            return;
        }

        if (newPassword.length < 6) {
            alert('Neues Passwort muss mindestens 6 Zeichen haben!');
            return;
        }

        try {
            const hashedOldPassword = await this.hashPassword(oldPassword);
            
            if (this.userAuth[this.currentUser] !== hashedOldPassword) {
                alert('Altes Passwort ist falsch!');
                return;
            }

            const hashedNewPassword = await this.hashPassword(newPassword);
            this.userAuth[this.currentUser] = hashedNewPassword;
            
            alert('Passwort erfolgreich geändert!');
            this.hideChangePasswordModal();
            
        } catch (error) {
            console.error('Password change error:', error);
            alert('Fehler beim Ändern des Passworts. Bitte versuchen Sie es erneut.');
        }
    }

    showDeleteAccountModal() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) modal.classList.remove('hidden');
    }

    hideDeleteAccountModal() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) modal.classList.add('hidden');
    }

    handleDeleteAccount() {
        if (!this.currentUser || this.userRole !== 'colleague') return;

        // Delete user data
        delete this.userAuth[this.currentUser];
        delete this.userQuotas[this.currentUser];
        delete this.planningData[this.currentUser];
        
        // Remove from colleagues list
        const index = this.colleagues.indexOf(this.currentUser);
        if (index > -1) {
            this.colleagues.splice(index, 1);
        }

        alert('Ihr Konto wurde erfolgreich gelöscht!');
        this.handleLogout();
    }

    showColleagueDetailModal(colleague) {
        if (this.userRole !== 'teamleader') return;

        this.selectedColleague = colleague;
        const stats = this.calculateMonthlyStats(colleague);
        const userQuota = this.userQuotas[colleague] || 40;

        const modal = document.getElementById('colleagueDetailModal');
        const nameElement = document.getElementById('colleagueDetailName');
        const statsElement = document.getElementById('colleagueDetailStats');

        if (nameElement) nameElement.textContent = `${colleague} - Details`;
        
        if (statsElement) {
            let quoteClass = 'success';
            if (stats.homeofficePercent > userQuota + 10) {
                quoteClass = 'danger';
            } else if (stats.homeofficePercent > userQuota) {
                quoteClass = 'warning';
            }

            statsElement.innerHTML = `
                <div class="colleague-detail-stat">
                    <span class="label">HomeOffice Quote:</span>
                    <span class="value ${quoteClass}">${stats.homeofficePercent.toFixed(1)}%</span>
                </div>
                <div class="colleague-detail-stat">
                    <span class="label">Ziel-Quote:</span>
                    <span class="value">≤ ${userQuota}%</span>
                </div>
                <div class="colleague-detail-stat">
                    <span class="label">HomeOffice Tage:</span>
                    <span class="value">${stats.homeofficeDays}</span>
                </div>
                <div class="colleague-detail-stat">
                    <span class="label">Büro Tage:</span>
                    <span class="value">${stats.officeDays}</span>
                </div>
                <div class="colleague-detail-stat">
                    <span class="label">Urlaub Tage:</span>
                    <span class="value">${stats.vacationDays}</span>
                </div>
                <div class="colleague-detail-stat">
                    <span class="label">Arbeitstage gesamt:</span>
                    <span class="value">${stats.totalWorkDays}</span>
                </div>
            `;
        }

        if (modal) modal.classList.remove('hidden');
    }

    hideColleagueDetailModal() {
        const modal = document.getElementById('colleagueDetailModal');
        if (modal) modal.classList.add('hidden');
        this.selectedColleague = null;
    }

    async handleResetColleaguePassword() {
        if (!this.selectedColleague || this.userRole !== 'teamleader') return;

        try {
            const hashedPassword = await this.hashPassword(this.resetPasswordDefault);
            this.userAuth[this.selectedColleague] = hashedPassword;
            
            alert(`Passwort für ${this.selectedColleague} wurde zurückgesetzt.\nNeues Passwort: ${this.resetPasswordDefault}`);
            this.hideColleagueDetailModal();
            
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Fehler beim Zurücksetzen des Passworts.');
        }
    }

    showDeleteColleagueModal() {
        if (!this.selectedColleague) return;
        
        const modal = document.getElementById('deleteColleagueModal');
        const nameElement = document.getElementById('deleteColleagueName');
        
        if (nameElement) nameElement.textContent = this.selectedColleague;
        if (modal) modal.classList.remove('hidden');
    }

    hideDeleteColleagueModal() {
        const modal = document.getElementById('deleteColleagueModal');
        if (modal) modal.classList.add('hidden');
    }

    handleDeleteColleague() {
        if (!this.selectedColleague || this.userRole !== 'teamleader') return;

        // Delete colleague data
        delete this.userAuth[this.selectedColleague];
        delete this.userQuotas[this.selectedColleague];
        delete this.planningData[this.selectedColleague];
        
        // Remove from colleagues list
        const index = this.colleagues.indexOf(this.selectedColleague);
        if (index > -1) {
            this.colleagues.splice(index, 1);
        }

        // Update dropdown
        this.populateColleagueDropdown();

        alert(`Kollege ${this.selectedColleague} wurde erfolgreich gelöscht!`);
        this.hideDeleteColleagueModal();
        this.hideColleagueDetailModal();
        this.updateTeamleaderDashboard();
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    updatePersonalDashboard() {
        if (!this.currentUser || this.userRole !== 'colleague') return;

        const stats = this.calculateMonthlyStats(this.currentUser);
        const userQuota = this.userQuotas[this.currentUser] || 40;
        
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const percentSpan = document.getElementById('homeofficePercent');
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(stats.homeofficePercent, 100)}%`;
            
            // Color coding for progress bar based on user's quota
            progressFill.className = 'progress-fill';
            if (stats.homeofficePercent > userQuota + 10) {
                progressFill.classList.add('danger');
            } else if (stats.homeofficePercent > userQuota) {
                progressFill.classList.add('warning');
            }
        }
        
        if (percentSpan) {
            percentSpan.textContent = `${stats.homeofficePercent.toFixed(1)}%`;
        }

        // Update month stats
        const workDaysSpan = document.getElementById('workDays');
        const homeOfficeDaysSpan = document.getElementById('homeOfficeDays');
        const officeDaysSpan = document.getElementById('officeDays');
        const vacationDaysSpan = document.getElementById('vacationDays');
        
        if (workDaysSpan) workDaysSpan.textContent = stats.totalWorkDays;
        if (homeOfficeDaysSpan) homeOfficeDaysSpan.textContent = stats.homeofficeDays;
        if (officeDaysSpan) officeDaysSpan.textContent = stats.officeDays;
        if (vacationDaysSpan) vacationDaysSpan.textContent = stats.vacationDays;

        // Update target display
        const statTarget = document.getElementById('statTarget');
        if (statTarget) {
            statTarget.textContent = `Ziel: ≤ ${userQuota}%`;
        }

        // Warning message
        const warningMessage = document.getElementById('warningMessage');
        if (warningMessage) {
            if (stats.homeofficePercent > userQuota) {
                warningMessage.style.display = 'block';
            } else {
                warningMessage.style.display = 'none';
            }
        }
    }

    updateTeamleaderDashboard() {
        if (this.userRole !== 'teamleader') return;

        const teamleaderStats = document.getElementById('teamleaderStats');
        const filter = document.getElementById('teamleaderFilter')?.value || 'all';
        
        if (!teamleaderStats) return;
        
        teamleaderStats.innerHTML = '';

        // Filter colleagues based on selection
        let filteredColleagues = [...this.colleagues];
        
        if (filter === 'violations') {
            filteredColleagues = this.colleagues.filter(colleague => {
                const stats = this.calculateMonthlyStats(colleague);
                const userQuota = this.userQuotas[colleague] || 40;
                return stats.homeofficePercent > userQuota;
            });
        } else if (filter === 'quota40') {
            filteredColleagues = this.colleagues.filter(colleague => {
                return (this.userQuotas[colleague] || 40) === 40;
            });
        } else if (filter === 'quota60') {
            filteredColleagues = this.colleagues.filter(colleague => {
                return (this.userQuotas[colleague] || 40) === 60;
            });
        }

        filteredColleagues.forEach(colleague => {
            const stats = this.calculateMonthlyStats(colleague);
            const userQuota = this.userQuotas[colleague] || 40;
            
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-leader-member';
            
            // Color coding für Quote
            let quoteClass = 'success';
            if (stats.homeofficePercent > userQuota + 10) {
                quoteClass = 'danger';
            } else if (stats.homeofficePercent > userQuota) {
                quoteClass = 'warning';
            }
            
            memberDiv.innerHTML = `
                <h4>${colleague}</h4>
                <div class="team-leader-member-stats">
                    <div class="team-leader-stat">
                        <h5>HomeOffice Quote</h5>
                        <div class="value ${quoteClass}"><strong>${stats.homeofficePercent.toFixed(1)}%</strong></div>
                    </div>
                    <div class="team-leader-stat">
                        <h5>Ziel-Quote</h5>
                        <div class="value">≤ ${userQuota}%</div>
                    </div>
                    <div class="team-leader-stat">
                        <h5>HomeOffice</h5>
                        <div class="value"><strong>${stats.homeofficeDays}</strong></div>
                    </div>
                    <div class="team-leader-stat">
                        <h5>Büro</h5>
                        <div class="value"><strong>${stats.officeDays}</strong></div>
                    </div>
                    <div class="team-leader-stat">
                        <h5>Urlaub</h5>
                        <div class="value"><strong>${stats.vacationDays}</strong></div>
                    </div>
                    <div class="team-leader-stat">
                        <h5>Arbeitstage</h5>
                        <div class="value">${stats.totalWorkDays}</div>
                    </div>
                </div>
            `;

            // Add click handler to show detail modal
            memberDiv.addEventListener('click', () => {
                this.showColleagueDetailModal(colleague);
            });

            teamleaderStats.appendChild(memberDiv);
        });
    }

    renderTeamOverview() {
        const teamGrid = document.getElementById('teamGrid');
        if (!teamGrid) return;
        
        teamGrid.innerHTML = '';

        this.colleagues.forEach(colleague => {
            const stats = this.calculateMonthlyStats(colleague);
            
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member';
            
            // Normale Kollegen sehen keine fremden Prozentzahlen, nur ihre eigenen
            const showPercentage = (this.userRole === 'teamleader') || (colleague === this.currentUser);
            
            let statsHTML = `
                <div class="team-stat">
                    <div>HomeOffice</div>
                    <div><strong>${stats.homeofficeDays}</strong></div>
                </div>
                <div class="team-stat">
                    <div>Büro</div>
                    <div><strong>${stats.officeDays}</strong></div>
                </div>
                <div class="team-stat">
                    <div>Urlaub</div>
                    <div><strong>${stats.vacationDays}</strong></div>
                </div>
            `;

            if (showPercentage) {
                const userQuota = this.userQuotas[colleague] || 40;
                let quoteStyle = '';
                if (stats.homeofficePercent > userQuota + 10) {
                    quoteStyle = 'color: var(--color-error);';
                } else if (stats.homeofficePercent > userQuota) {
                    quoteStyle = 'color: var(--color-warning);';
                } else {
                    quoteStyle = 'color: var(--color-success);';
                }
                
                statsHTML += `
                    <div class="team-stat">
                        <div>Quote</div>
                        <div style="${quoteStyle}"><strong>${stats.homeofficePercent.toFixed(1)}%</strong></div>
                    </div>
                `;
            }
            
            memberDiv.innerHTML = `
                <h4>${colleague}</h4>
                <div class="team-member-stats">
                    ${statsHTML}
                </div>
            `;

            teamGrid.appendChild(memberDiv);
        });
    }

    calculateMonthlyStats(colleague) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        let homeofficeDays = 0;
        let officeDays = 0;
        let vacationDays = 0;
        let azDays = 0;
        let totalWorkDays = 0;

        // Iterate through all days of the current month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
            const dateStr = this.formatDate(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isHoliday = this.getHoliday(dateStr);
            
            if (!isWeekend && !isHoliday) {
                const status = this.getStatus(colleague, dateStr);
                
                if (status === 'urlaub') {
                    vacationDays++;
                } else {
                    totalWorkDays++;
                    
                    switch (status) {
                        case 'homeoffice':
                            homeofficeDays++;
                            break;
                        case 'buero':
                            officeDays++;
                            break;
                        case 'az':
                            azDays++;
                            break;
                    }
                }
            }
        }

        const homeofficePercent = totalWorkDays > 0 ? (homeofficeDays / totalWorkDays) * 100 : 0;

        return {
            homeofficeDays,
            officeDays,
            vacationDays,
            azDays,
            totalWorkDays,
            homeofficePercent
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing HomeOfficePlanner...');
    try {
        window.homeOfficePlanner = new HomeOfficePlanner();
    } catch (error) {
        console.error('Failed to initialize HomeOfficePlanner:', error);
    }
});