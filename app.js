// HomeOffice Planner JavaScript - Complete Firebase Realtime Database Integration
class HomeOfficePlanner {
    constructor() {
        // Firebase integration
        this.isFirebaseEnabled = false;
        this.database = null;
        this.currentUserUID = null;
        this.dataListeners = new Map(); // Track active listeners
        
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

        this.statusTypes = {
            "homeoffice": {"name": "Home-Office", "color": "#FF8C00", "symbol": "🏠"},
            "buero": {"name": "Büro", "color": "#4169E1", "symbol": "🏢"},
            "urlaub": {"name": "Urlaub", "color": "#32CD32", "symbol": "🏖️"},
            "az": {"name": "AZ", "color": "#808080", "symbol": "⏰"}
        };

        // Password configuration
        this.teamleaderPassword = "teamleiter123";
        this.defaultPassword = "password123";
        this.newPasswordDefault = "NeuesPasswort123";

        // Application state
        this.colleagues = ["Torsten Zapp", "Anna", "Michael", "Sarah", "Thomas"];
        this.currentUser = null;
        this.userRole = null;
        this.currentDate = new Date();
        this.planningData = {};
        this.colleaguePasswords = {};
        this.homeofficeRules = {};
        this.selectedDateForStatus = null;
        this.activeTab = 'overview';
        this.selectedColleagueForAction = null;
        this.isTeamOverviewMode = false;

        // Initialize default data
        this.initializeDefaultPasswords();
        this.initializeDefaultRules();
    }

    // ===== FIREBASE INTEGRATION =====
    
    async initializeFirebase() {
        try {
            // Add a timeout for Firebase initialization
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firebase initialization timeout')), 5000)
            );

            const firebaseCheck = new Promise((resolve) => {
                if (window.firebaseDB && typeof window.firebaseDB === 'object') {
                    this.database = window.firebaseDB;
                    this.isFirebaseEnabled = true;
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            const result = await Promise.race([firebaseCheck, timeout]);
            
            if (result && this.isFirebaseEnabled) {
                await this.setupConnectionMonitoring();
                this.updateConnectionStatus('🟢 Firebase verbunden');
                console.log('Firebase successfully initialized');
                return true;
            } else {
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.log('Firebase not available - using local mode:', error.message);
            this.isFirebaseEnabled = false;
            this.updateConnectionStatus('🔴 Offline Modus');
            return false;
        }
    }

    async setupConnectionMonitoring() {
        if (!this.isFirebaseEnabled) return;

        try {
            // Import Firebase functions dynamically
            const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            
            // Monitor connection status
            const connectedRef = ref(this.database, '.info/connected');
            onValue(connectedRef, (snapshot) => {
                if (snapshot.val() === true) {
                    this.updateLiveStatus('🟢 Live');
                } else {
                    this.updateLiveStatus('🔴 Offline');
                }
            });
        } catch (error) {
            console.error('Connection monitoring setup failed:', error);
            this.updateLiveStatus('🔴 Offline');
        }
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

    // SHA-256 Hash function
    async sha256Hash(message) {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            try {
                const msgBuffer = new TextEncoder().encode(message);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (error) {
                console.warn('SHA-256 not available, using fallback:', error);
                return this.simpleHash(message);
            }
        } else {
            // Fallback for environments without crypto.subtle
            return this.simpleHash(message);
        }
    }

    // Firebase Data Operations
    async writeData(path, data) {
        if (!this.isFirebaseEnabled) {
            console.log('Firebase not enabled - data not saved to cloud');
            return;
        }

        try {
            const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            const dataRef = ref(this.database, path);
            await set(dataRef, data);
        } catch (error) {
            console.error('Error writing data:', error);
        }
    }

    async updateData(path, updates) {
        if (!this.isFirebaseEnabled) {
            console.log('Firebase not enabled - data not updated in cloud');
            return;
        }

        try {
            const { ref, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            const dataRef = ref(this.database, path);
            await update(dataRef, updates);
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    async removeData(path) {
        if (!this.isFirebaseEnabled) {
            console.log('Firebase not enabled - data not removed from cloud');
            return;
        }

        try {
            const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            const dataRef = ref(this.database, path);
            await remove(dataRef);
        } catch (error) {
            console.error('Error removing data:', error);
        }
    }

    async setupDataListeners(uid) {
        if (!this.isFirebaseEnabled) return;

        try {
            const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

            // Listen to user profile changes
            const userRef = ref(this.database, `users/${uid}/profile`);
            const userListener = onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    this.handleUserDataUpdate(userData);
                }
            });
            this.dataListeners.set(`user_${uid}`, userListener);

            // Listen to planning data changes
            const plansRef = ref(this.database, `plans/${uid}`);
            const plansListener = onValue(plansRef, (snapshot) => {
                const plansData = snapshot.val();
                this.handlePlansDataUpdate(plansData || {});
            });
            this.dataListeners.set(`plans_${uid}`, plansListener);

            // For teamleader, listen to all users
            if (this.userRole === 'teamleader') {
                this.setupTeamDataListeners();
            }

        } catch (error) {
            console.error('Error setting up data listeners:', error);
        }
    }

    async setupTeamDataListeners() {
        if (!this.isFirebaseEnabled || this.userRole !== 'teamleader') return;

        try {
            const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

            // Listen to all users
            const allUsersRef = ref(this.database, 'users');
            const allUsersListener = onValue(allUsersRef, (snapshot) => {
                const allUsers = snapshot.val();
                if (allUsers) {
                    this.handleAllUsersDataUpdate(allUsers);
                }
            });
            this.dataListeners.set('all_users', allUsersListener);

            // Listen to all plans
            const allPlansRef = ref(this.database, 'plans');
            const allPlansListener = onValue(allPlansRef, (snapshot) => {
                const allPlans = snapshot.val();
                this.handleAllPlansDataUpdate(allPlans || {});
            });
            this.dataListeners.set('all_plans', allPlansListener);

        } catch (error) {
            console.error('Error setting up team data listeners:', error);
        }
    }

    handleUserDataUpdate(userData) {
        if (userData.quota) {
            this.homeofficeRules[this.currentUser] = userData.quota;
        }
        // Update UI if needed
        if (this.userRole === 'employee' && !this.isTeamOverviewMode) {
            this.updateDashboard(this.currentUser);
        }
    }

    handlePlansDataUpdate(plansData) {
        if (!this.planningData[this.currentUser]) {
            this.planningData[this.currentUser] = {};
        }
        
        // Flatten the monthly data structure
        for (const monthKey in plansData) {
            const monthData = plansData[monthKey];
            for (const dateKey in monthData) {
                this.planningData[this.currentUser][dateKey] = monthData[dateKey];
            }
        }
        
        // Update UI
        this.renderCalendar();
        if (this.userRole === 'employee' && !this.isTeamOverviewMode) {
            this.updateDashboard(this.currentUser);
        }
    }

    handleAllUsersDataUpdate(allUsers) {
        this.colleagues = [];
        for (const uid in allUsers) {
            const userData = allUsers[uid];
            if (userData.profile && userData.profile.name) {
                this.colleagues.push(userData.profile.name);
                if (userData.profile.quota) {
                    this.homeofficeRules[userData.profile.name] = userData.profile.quota;
                }
            }
        }
        
        // Update UI
        this.populateEmployeeSelect();
        this.populateDetailColleagueSelect();
        if (this.activeTab === 'overview') {
            this.renderTeamOverview();
        }
    }

    handleAllPlansDataUpdate(allPlans) {
        this.planningData = {};
        
        // Process all users' plans
        for (const uid in allPlans) {
            // Find username for this UID
            let username = null;
            // This is a simplified mapping - in real implementation, you'd maintain a UID->username mapping
            for (const colleague of this.colleagues) {
                if (this.getUserUID(colleague) === uid) {
                    username = colleague;
                    break;
                }
            }
            
            if (username) {
                this.planningData[username] = {};
                const userPlans = allPlans[uid];
                
                // Flatten monthly structure
                for (const monthKey in userPlans) {
                    const monthData = userPlans[monthKey];
                    for (const dateKey in monthData) {
                        this.planningData[username][dateKey] = monthData[dateKey];
                    }
                }
            }
        }
        
        // Update UI
        this.renderCalendar();
        if (this.isTeamOverviewMode) {
            this.renderTeamCalendars();
        }
        if (this.activeTab === 'overview') {
            this.renderTeamOverview();
        }
    }

    cleanupDataListeners() {
        // Remove all active listeners
        for (const [key, unsubscribe] of this.dataListeners) {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        }
        this.dataListeners.clear();
    }

    getUserUID(username) {
        // Simple UID generation based on username
        // In production, this should be a proper Firebase Auth UID
        return btoa(username).replace(/[^a-zA-Z0-9]/g, '').substr(0, 20);
    }

    async saveUserProfile(username, data) {
        const uid = this.getUserUID(username);
        await this.writeData(`users/${uid}/profile`, {
            name: username,
            role: data.role || 'employee',
            quota: data.quota || 40,
            passwordHash: data.passwordHash,
            lastUpdated: Date.now()
        });
    }

    async savePlanningData(username, date, status) {
        const uid = this.getUserUID(username);
        const yearMonth = date.substring(0, 7); // YYYY-MM
        
        if (status) {
            await this.writeData(`plans/${uid}/${yearMonth}/${date}`, status);
        } else {
            await this.removeData(`plans/${uid}/${yearMonth}/${date}`);
        }
    }

    // ===== ORIGINAL FUNCTIONALITY =====

    initializeDefaultPasswords() {
        this.colleagues.forEach(colleague => {
            this.colleaguePasswords[colleague] = this.simpleHash(this.defaultPassword);
        });
    }

    initializeDefaultRules() {
        this.colleagues.forEach(colleague => {
            this.homeofficeRules[colleague] = 40;
        });
    }

    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString();
    }

    async init() {
        console.log('Initializing HomeOffice Planner...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        try {
            // Initialize Firebase with timeout
            await this.initializeFirebase();
            
            // Setup UI
            this.showLoginScreen();
            this.populateEmployeeSelect();
            this.setupEventListeners();
            
            console.log('HomeOffice Planner initialized successfully');
        } catch (error) {
            console.error('Failed to initialize HomeOffice Planner:', error);
            this.updateConnectionStatus('🔴 Initialisierungsfehler');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.setupLoginListeners();
            this.setupNavigationListeners();
            this.setupModalListeners();
            this.setupTeamleaderListeners();
            this.setupPasswordListeners();
            this.setupDeleteAccountListeners();
            this.setupHomeofficeRuleListeners();
            this.setupTeamOverviewListeners();
            console.log('Event listeners setup complete');
        }, 100);
    }

    setupLoginListeners() {
        const userTypeSelect = document.getElementById('userType');
        const employeeLoginBtn = document.getElementById('employeeLoginBtn');
        const teamleaderLoginBtn = document.getElementById('teamleaderLoginBtn');
        const newEmployeeRegisterBtn = document.getElementById('newEmployeeRegisterBtn');

        console.log('Setting up login listeners...', {
            userTypeSelect: !!userTypeSelect,
            employeeLoginBtn: !!employeeLoginBtn,
            teamleaderLoginBtn: !!teamleaderLoginBtn,
            newEmployeeRegisterBtn: !!newEmployeeRegisterBtn
        });

        if (userTypeSelect) {
            // Remove any existing listeners
            const newSelect = userTypeSelect.cloneNode(true);
            userTypeSelect.parentNode.replaceChild(newSelect, userTypeSelect);
            
            newSelect.addEventListener('change', (e) => {
                console.log('User type changed:', e.target.value);
                this.showLoginType(e.target.value);
            });
        }

        if (employeeLoginBtn) {
            employeeLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Employee login clicked');
                this.loginAsEmployee();
            });
        }

        if (teamleaderLoginBtn) {
            teamleaderLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Teamleader login clicked');
                this.loginAsTeamleader();
            });
        }

        if (newEmployeeRegisterBtn) {
            newEmployeeRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('New employee register clicked');
                this.registerNewEmployee();
            });
        }

        // Enter key handling
        const employeePassword = document.getElementById('employeePassword');
        if (employeePassword) {
            employeePassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.loginAsEmployee();
                }
            });
        }

        const teamleaderPassword = document.getElementById('teamleaderPassword');
        if (teamleaderPassword) {
            teamleaderPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.loginAsTeamleader();
                }
            });
        }

        const newEmployeePasswordConfirm = document.getElementById('newEmployeePasswordConfirm');
        if (newEmployeePasswordConfirm) {
            newEmployeePasswordConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.registerNewEmployee();
                }
            });
        }
    }

    setupNavigationListeners() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        const logoutBtn = document.getElementById('logoutBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateMonth(-1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateMonth(1);
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    setupModalListeners() {
        const cancelStatusBtn = document.getElementById('cancelStatusChange');

        if (cancelStatusBtn) {
            cancelStatusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideStatusModal();
            });
        }

        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const status = e.currentTarget.dataset.status;
                this.setStatus(status);
            });
        });

        document.querySelectorAll('.modal__overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAllModals();
                }
            });
        });
    }

    setupHomeofficeRuleListeners() {
        const homeofficeRule = document.getElementById('homeofficeRule');
        if (homeofficeRule) {
            homeofficeRule.addEventListener('change', async (e) => {
                if (this.currentUser && this.userRole === 'employee') {
                    const newQuota = parseInt(e.target.value);
                    this.homeofficeRules[this.currentUser] = newQuota;
                    
                    // Save to Firebase
                    const currentPasswordHash = this.colleaguePasswords[this.currentUser];
                    await this.saveUserProfile(this.currentUser, {
                        role: 'employee',
                        quota: newQuota,
                        passwordHash: currentPasswordHash
                    });
                    
                    this.updateDashboard(this.currentUser);
                }
            });
        }

        const teamleaderHomeofficeRule = document.getElementById('teamleaderHomeofficeRule');
        if (teamleaderHomeofficeRule) {
            teamleaderHomeofficeRule.addEventListener('change', (e) => {
                if (this.userRole === 'teamleader') {
                    this.renderTeamOverview();
                }
            });
        }
    }

    setupTeamOverviewListeners() {
        const teamOverviewBtn = document.getElementById('teamOverviewBtn');
        if (teamOverviewBtn) {
            teamOverviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTeamOverview();
            });
        }

        const teamleaderTeamOverviewBtn = document.getElementById('teamleaderTeamOverviewBtn');
        if (teamleaderTeamOverviewBtn) {
            teamleaderTeamOverviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTeamOverview();
            });
        }

        const backToDashboard = document.getElementById('backToDashboard');
        if (backToDashboard) {
            backToDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideTeamOverview();
            });
        }
    }

    setupPasswordListeners() {
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            });
        }

        const confirmPasswordChangeBtn = document.getElementById('confirmPasswordChange');
        const cancelPasswordChangeBtn = document.getElementById('cancelPasswordChange');

        if (confirmPasswordChangeBtn) {
            confirmPasswordChangeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        if (cancelPasswordChangeBtn) {
            cancelPasswordChangeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideChangePasswordModal();
            });
        }

        const confirmResetPasswordBtn = document.getElementById('confirmResetPassword');
        const cancelResetPasswordBtn = document.getElementById('cancelResetPassword');

        if (confirmResetPasswordBtn) {
            confirmResetPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetColleaguePassword();
            });
        }

        if (cancelResetPasswordBtn) {
            cancelResetPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideResetPasswordModal();
            });
        }
    }

    setupDeleteAccountListeners() {
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeleteAccountModal();
            });
        }

        const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccount');
        const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccount');

        if (confirmDeleteAccountBtn) {
            confirmDeleteAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteCurrentUserAccount();
            });
        }

        if (cancelDeleteAccountBtn) {
            cancelDeleteAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideDeleteAccountModal();
            });
        }

        const confirmDeleteColleagueBtn = document.getElementById('confirmDeleteColleague');
        const cancelDeleteColleagueBtn = document.getElementById('cancelDeleteColleague');

        if (confirmDeleteColleagueBtn) {
            confirmDeleteColleagueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteColleague();
            });
        }

        if (cancelDeleteColleagueBtn) {
            cancelDeleteColleagueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideDeleteColleagueModal();
            });
        }
    }

    setupTeamleaderListeners() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        const detailColleagueSelect = document.getElementById('detailColleagueSelect');
        if (detailColleagueSelect) {
            detailColleagueSelect.addEventListener('change', (e) => {
                this.showColleagueDetail(e.target.value);
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.renderTeamOverview();
            });
        }

        const exportBtn = document.getElementById('exportReportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportMonthReport();
            });
        }
    }

    showLoginScreen() {
        console.log('Showing login screen...');
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
            console.log('Login screen shown');
        }
        if (mainApp) mainApp.classList.add('hidden');
    }

    showLoginType(type) {
        console.log('Showing login type:', type);
        const employeeLogin = document.getElementById('employeeLogin');
        const teamleaderLogin = document.getElementById('teamleaderLogin');
        const newEmployeeLogin = document.getElementById('newEmployeeLogin');

        // Hide all first
        if (employeeLogin) employeeLogin.classList.add('hidden');
        if (teamleaderLogin) teamleaderLogin.classList.add('hidden');
        if (newEmployeeLogin) newEmployeeLogin.classList.add('hidden');

        // Show the selected type
        if (type === 'employee' && employeeLogin) {
            employeeLogin.classList.remove('hidden');
            console.log('Employee login shown');
        } else if (type === 'teamleader' && teamleaderLogin) {
            teamleaderLogin.classList.remove('hidden');
            console.log('Teamleader login shown');
        } else if (type === 'newEmployee' && newEmployeeLogin) {
            newEmployeeLogin.classList.remove('hidden');
            console.log('New employee login shown');
        }
    }

    populateEmployeeSelect() {
        console.log('Populating employee select...');
        const select = document.getElementById('employeeName');
        if (!select) {
            console.warn('Employee select not found');
            return;
        }
        
        select.innerHTML = '<option value="">-- Kollege auswählen --</option>';
        
        this.colleagues.forEach(colleague => {
            const option = document.createElement('option');
            option.value = colleague;
            option.textContent = colleague;
            select.appendChild(option);
        });
        
        console.log('Employee select populated with', this.colleagues.length, 'colleagues');
    }

    async loginAsEmployee() {
        const employeeName = document.getElementById('employeeName');
        const employeePassword = document.getElementById('employeePassword');
        
        console.log('Attempting employee login...');
        
        if (!employeeName || !employeeName.value) {
            alert('Bitte wählen Sie einen Kollegen aus.');
            return;
        }

        if (!employeePassword || !employeePassword.value) {
            alert('Bitte geben Sie ein Passwort ein.');
            return;
        }

        const hashedPassword = await this.sha256Hash(employeePassword.value);
        const storedPassword = this.colleaguePasswords[employeeName.value];

        if (hashedPassword !== storedPassword) {
            alert('Falsches Passwort!');
            return;
        }

        this.currentUser = employeeName.value;
        this.currentUserUID = this.getUserUID(this.currentUser);
        this.userRole = 'employee';
        
        console.log('Employee login successful:', this.currentUser);
        
        // Setup Firebase listeners for this user
        await this.setupDataListeners(this.currentUserUID);
        
        this.showMainApplication();
    }

    async loginAsTeamleader() {
        const teamleaderPassword = document.getElementById('teamleaderPassword');
        
        console.log('Attempting teamleader login...');
        
        if (!teamleaderPassword || !teamleaderPassword.value) {
            alert('Bitte geben Sie das Teamleiter-Passwort ein.');
            return;
        }

        if (teamleaderPassword.value !== this.teamleaderPassword) {
            alert('Falsches Teamleiter-Passwort!');
            return;
        }

        this.currentUser = "Teamleiter";
        this.userRole = 'teamleader';
        
        console.log('Teamleader login successful');
        
        // Setup Firebase listeners for teamleader
        await this.setupTeamDataListeners();
        
        this.showMainApplication();
    }

    async registerNewEmployee() {
        const newEmployeeName = document.getElementById('newEmployeeName');
        const newEmployeePassword = document.getElementById('newEmployeePassword');
        const newEmployeePasswordConfirm = document.getElementById('newEmployeePasswordConfirm');
        
        console.log('Attempting new employee registration...');
        
        if (!newEmployeeName || !newEmployeeName.value.trim()) {
            alert('Bitte geben Sie einen Namen ein.');
            return;
        }

        if (!newEmployeePassword || !newEmployeePassword.value) {
            alert('Bitte geben Sie ein Passwort ein.');
            return;
        }

        if (!newEmployeePasswordConfirm || !newEmployeePasswordConfirm.value) {
            alert('Bitte bestätigen Sie das Passwort.');
            return;
        }

        if (newEmployeePassword.value !== newEmployeePasswordConfirm.value) {
            alert('Die Passwörter stimmen nicht überein.');
            return;
        }

        if (newEmployeePassword.value.length < 6) {
            alert('Das Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

        const name = newEmployeeName.value.trim();

        if (this.colleagues.includes(name)) {
            alert('Dieser Name ist bereits vergeben!');
            return;
        }

        // Add new colleague
        this.colleagues.push(name);
        this.planningData[name] = {};
        const hashedPassword = await this.sha256Hash(newEmployeePassword.value);
        this.colleaguePasswords[name] = hashedPassword;
        this.homeofficeRules[name] = 40;
        
        // Save to Firebase
        await this.saveUserProfile(name, {
            role: 'employee',
            quota: 40,
            passwordHash: hashedPassword
        });
        
        this.populateEmployeeSelect();
        
        this.currentUser = name;
        this.currentUserUID = this.getUserUID(name);
        this.userRole = 'employee';
        
        console.log('New employee registration successful:', name);
        
        // Setup Firebase listeners for new user
        await this.setupDataListeners(this.currentUserUID);
        
        this.showMainApplication();
    }

    showMainApplication() {
        console.log('Showing main application...');
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        const currentUserSpan = document.getElementById('currentUser');
        const securityNotice = document.getElementById('securityNotice');
        const teamleaderNav = document.getElementById('teamleaderNav');
        const employeeView = document.getElementById('employeeView');
        const teamleaderView = document.getElementById('teamleaderView');

        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        if (currentUserSpan) currentUserSpan.textContent = this.currentUser;

        if (this.userRole === 'teamleader') {
            if (securityNotice) securityNotice.classList.remove('hidden');
            if (teamleaderNav) teamleaderNav.classList.remove('hidden');
            if (employeeView) employeeView.classList.add('hidden');
            if (teamleaderView) teamleaderView.classList.remove('hidden');
            
            this.populateDetailColleagueSelect();
            this.renderTeamOverview();
            this.switchTab('overview');
        } else {
            if (securityNotice) securityNotice.classList.add('hidden');
            if (teamleaderNav) teamleaderNav.classList.add('hidden');
            if (employeeView) employeeView.classList.remove('hidden');
            if (teamleaderView) teamleaderView.classList.add('hidden');
            
            this.selectEmployee(this.currentUser);
        }

        this.updateCurrentMonth();
        this.renderCalendar();
        
        console.log('Main application shown for user:', this.currentUser, 'role:', this.userRole);
    }

    logout() {
        console.log('Logging out...');
        // Clean up Firebase listeners
        this.cleanupDataListeners();
        
        this.currentUser = null;
        this.currentUserUID = null;
        this.userRole = null;
        this.activeTab = 'overview';
        this.isTeamOverviewMode = false;
        
        // Reset login form
        const userTypeSelect = document.getElementById('userType');
        const employeeName = document.getElementById('employeeName');
        const employeePassword = document.getElementById('employeePassword');
        const teamleaderPassword = document.getElementById('teamleaderPassword');
        const newEmployeeName = document.getElementById('newEmployeeName');
        const newEmployeePassword = document.getElementById('newEmployeePassword');
        const newEmployeePasswordConfirm = document.getElementById('newEmployeePasswordConfirm');
        
        if (userTypeSelect) userTypeSelect.value = '';
        if (employeeName) employeeName.value = '';
        if (employeePassword) employeePassword.value = '';
        if (teamleaderPassword) teamleaderPassword.value = '';
        if (newEmployeeName) newEmployeeName.value = '';
        if (newEmployeePassword) newEmployeePassword.value = '';
        if (newEmployeePasswordConfirm) newEmployeePasswordConfirm.value = '';
        
        this.showLoginType('');
        this.showLoginScreen();
    }

    async setStatus(status) {
        if (!this.currentUser || !this.selectedDateForStatus || this.userRole !== 'employee') return;

        if (status === 'clear') {
            if (this.planningData[this.currentUser]) {
                delete this.planningData[this.currentUser][this.selectedDateForStatus];
            }
            // Remove from Firebase
            await this.savePlanningData(this.currentUser, this.selectedDateForStatus, null);
        } else {
            if (!this.planningData[this.currentUser]) {
                this.planningData[this.currentUser] = {};
            }
            this.planningData[this.currentUser][this.selectedDateForStatus] = status;
            
            // Save to Firebase
            await this.savePlanningData(this.currentUser, this.selectedDateForStatus, status);
        }

        this.hideStatusModal();
        this.renderCalendar();
        this.updateDashboard(this.currentUser);
    }

    showTeamOverview() {
        this.isTeamOverviewMode = true;
        const teamOverviewModal = document.getElementById('teamOverviewModal');
        const employeeView = document.getElementById('employeeView');
        const teamleaderView = document.getElementById('teamleaderView');
        
        if (teamOverviewModal) teamOverviewModal.classList.remove('hidden');
        if (employeeView) employeeView.classList.add('hidden');
        if (teamleaderView) teamleaderView.classList.add('hidden');
        
        this.renderTeamCalendars();
    }

    hideTeamOverview() {
        this.isTeamOverviewMode = false;
        const teamOverviewModal = document.getElementById('teamOverviewModal');
        const employeeView = document.getElementById('employeeView');
        const teamleaderView = document.getElementById('teamleaderView');
        
        if (teamOverviewModal) teamOverviewModal.classList.add('hidden');
        
        if (this.userRole === 'employee') {
            if (employeeView) employeeView.classList.remove('hidden');
        } else if (this.userRole === 'teamleader') {
            if (teamleaderView) teamleaderView.classList.remove('hidden');
        }
    }

    renderTeamCalendars() {
        const container = document.getElementById('teamCalendars');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.colleagues.forEach(colleague => {
            const colleagueDiv = document.createElement('div');
            colleagueDiv.className = 'colleague-calendar';
            
            const stats = this.calculateMonthlyStats(colleague);
            const rule = this.homeofficeRules[colleague] || 40;
            
            const header = document.createElement('h4');
            header.innerHTML = `
                ${colleague}
                ${this.userRole === 'teamleader' ? `<span>HomeOffice: ${stats.homeofficePercent.toFixed(1)}%</span>` : ''}
            `;
            colleagueDiv.appendChild(header);
            
            if (this.userRole === 'teamleader') {
                const statsDiv = document.createElement('div');
                statsDiv.className = 'colleague-stats';
                statsDiv.innerHTML = `
                    <span>Regel: ${rule}%</span>
                    <span>HomeOffice: ${stats.homeofficeDays} Tage</span>
                    <span>Büro: ${stats.officeDays} Tage</span>
                    <span>Urlaub: ${stats.vacationDays} Tage</span>
                    <span class="${stats.homeofficePercent > rule ? 'status-warning' : 'status-ok'}">
                        ${stats.homeofficePercent > rule ? 'ÜBERSCHREITUNG' : 'OK'}
                    </span>
                `;
                colleagueDiv.appendChild(statsDiv);
            }
            
            const miniCalendar = this.createMiniCalendar(colleague);
            colleagueDiv.appendChild(miniCalendar);
            
            container.appendChild(colleagueDiv);
        });
    }

    createMiniCalendar(colleague) {
        const calendarDiv = document.createElement('div');
        calendarDiv.className = 'mini-calendar';
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        
        const grid = document.createElement('div');
        grid.className = 'calendar__grid';
        grid.style.fontSize = '12px';
        
        ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar__day-header';
            header.textContent = day;
            grid.appendChild(header);
        });
        
        const startDate = new Date(firstDay);
        const dayOfWeek = (firstDay.getDay() + 6) % 7;
        startDate.setDate(firstDay.getDate() - dayOfWeek);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar__day';
            dayDiv.style.minHeight = '30px';
            dayDiv.style.padding = '2px';
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const dateStr = this.formatDate(currentDate);
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
            
            const dayNumber = document.createElement('div');
            dayNumber.textContent = currentDate.getDate();
            dayNumber.style.fontSize = '10px';
            dayDiv.appendChild(dayNumber);
            
            if (isCurrentMonth && !holiday && !isWeekend) {
                const status = this.getStatus(colleague, dateStr);
                if (status) {
                    const statusDiv = document.createElement('div');
                    statusDiv.className = `day-status ${status}`;
                    statusDiv.style.fontSize = '8px';
                    statusDiv.textContent = this.statusTypes[status].symbol;
                    dayDiv.appendChild(statusDiv);
                }
            }
            
            grid.appendChild(dayDiv);
        }
        
        calendarDiv.appendChild(grid);
        return calendarDiv;
    }

    async changePassword() {
        const oldPasswordInput = document.getElementById('oldPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

        if (!oldPasswordInput?.value || !newPasswordInput?.value || !confirmNewPasswordInput?.value) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }

        if (newPasswordInput.value !== confirmNewPasswordInput.value) {
            alert('Die neuen Passwörter stimmen nicht überein.');
            return;
        }

        if (newPasswordInput.value.length < 6) {
            alert('Das neue Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

        const oldHashedPassword = await this.sha256Hash(oldPasswordInput.value);
        const currentPassword = this.colleaguePasswords[this.currentUser];

        if (oldHashedPassword !== currentPassword) {
            alert('Das alte Passwort ist falsch.');
            return;
        }

        const newHashedPassword = await this.sha256Hash(newPasswordInput.value);
        this.colleaguePasswords[this.currentUser] = newHashedPassword;
        
        // Save to Firebase
        await this.saveUserProfile(this.currentUser, {
            role: 'employee',
            quota: this.homeofficeRules[this.currentUser],
            passwordHash: newHashedPassword
        });
        
        this.hideChangePasswordModal();
        alert('Passwort erfolgreich geändert!');
    }

    async deleteCurrentUserAccount() {
        if (!this.currentUser || this.userRole !== 'employee') return;

        const index = this.colleagues.indexOf(this.currentUser);
        if (index > -1) {
            this.colleagues.splice(index, 1);
        }

        delete this.planningData[this.currentUser];
        delete this.colleaguePasswords[this.currentUser];
        delete this.homeofficeRules[this.currentUser];

        // Remove from Firebase
        const uid = this.getUserUID(this.currentUser);
        await this.removeData(`users/${uid}`);
        await this.removeData(`plans/${uid}`);

        this.hideDeleteAccountModal();
        alert('Ihr Konto wurde erfolgreich gelöscht.');
        this.logout();
    }

    selectEmployee(employeeName) {
        const selectedNameSpan = document.getElementById('selectedColleagueName');
        if (selectedNameSpan) selectedNameSpan.textContent = employeeName;
        
        if (!this.planningData[employeeName]) {
            this.planningData[employeeName] = {};
        }
        
        const homeofficeRule = document.getElementById('homeofficeRule');
        if (homeofficeRule) {
            homeofficeRule.value = this.homeofficeRules[employeeName] || 40;
        }
        
        this.renderCalendar();
        this.updateDashboard(employeeName);
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateCurrentMonth();
        this.renderCalendar();
        
        if (this.userRole === 'employee' && !this.isTeamOverviewMode) {
            this.updateDashboard(this.currentUser);
        } else if (this.userRole === 'teamleader') {
            if (this.isTeamOverviewMode) {
                this.renderTeamCalendars();
            } else if (this.activeTab === 'overview') {
                this.renderTeamOverview();
            } else if (this.activeTab === 'reports') {
                this.generateReportPreview();
            }
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
        if (this.isTeamOverviewMode) {
            return;
        }

        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        const grid = calendar.querySelector('.calendar__grid');
        if (!grid) return;
        
        const existingDays = grid.querySelectorAll('.calendar__day');
        existingDays.forEach(day => day.remove());

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        
        const dayOfWeek = (firstDay.getDay() + 6) % 7;
        startDate.setDate(firstDay.getDate() - dayOfWeek);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 41);

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

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayDiv.appendChild(dayNumber);

        if (holiday) {
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday.name;
            dayDiv.appendChild(holidayName);
        }

        if (isCurrentMonth && !holiday && !isWeekend) {
            if (this.userRole === 'employee') {
                const status = this.getStatus(this.currentUser, dateStr);
                if (status) {
                    const statusDiv = document.createElement('div');
                    statusDiv.className = `day-status ${status}`;
                    statusDiv.textContent = `${this.statusTypes[status].symbol} ${this.statusTypes[status].name}`;
                    dayDiv.appendChild(statusDiv);
                }
                
                dayDiv.style.cursor = 'pointer';
                dayDiv.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showStatusModal(dateStr);
                });
            } else if (this.userRole === 'teamleader') {
                dayDiv.classList.add('readonly');
                
                this.colleagues.forEach(colleague => {
                    const status = this.getStatus(colleague, dateStr);
                    if (status) {
                        const statusDiv = document.createElement('div');
                        statusDiv.className = `day-status ${status}`;
                        statusDiv.style.fontSize = '9px';
                        statusDiv.style.marginBottom = '1px';
                        statusDiv.textContent = `${colleague.substr(0,3)}: ${this.statusTypes[status].symbol}`;
                        dayDiv.appendChild(statusDiv);
                    }
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

    showStatusModal(dateStr) {
        if (this.userRole !== 'employee') return;

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

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    showChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        const oldPasswordInput = document.getElementById('oldPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

        if (oldPasswordInput) oldPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';
        
        if (modal) modal.classList.remove('hidden');
        if (oldPasswordInput) oldPasswordInput.focus();
    }

    hideChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.classList.add('hidden');
    }

    showDeleteAccountModal() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) modal.classList.remove('hidden');
    }

    hideDeleteAccountModal() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) modal.classList.add('hidden');
    }

    updateDashboard(colleague) {
        if (!colleague) return;

        const stats = this.calculateMonthlyStats(colleague);
        const rule = this.homeofficeRules[colleague] || 40;
        
        const progressFill = document.getElementById('progressFill');
        const percentSpan = document.getElementById('homeofficePercent');
        const statTarget = document.getElementById('statTarget');
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(stats.homeofficePercent, 100)}%`;
            
            progressFill.className = 'progress-fill';
            if (stats.homeofficePercent > rule + 10) {
                progressFill.classList.add('danger');
            } else if (stats.homeofficePercent > rule) {
                progressFill.classList.add('warning');
            }
        }
        
        if (percentSpan) {
            percentSpan.textContent = `${stats.homeofficePercent.toFixed(1)}%`;
        }

        if (statTarget) {
            statTarget.textContent = `Ziel: ≤ ${rule}%`;
        }

        const workDaysSpan = document.getElementById('workDays');
        const homeOfficeDaysSpan = document.getElementById('homeOfficeDays');
        const officeDaysSpan = document.getElementById('officeDays');
        const vacationDaysSpan = document.getElementById('vacationDays');
        
        if (workDaysSpan) workDaysSpan.textContent = stats.totalWorkDays;
        if (homeOfficeDaysSpan) homeOfficeDaysSpan.textContent = stats.homeofficeDays;
        if (officeDaysSpan) officeDaysSpan.textContent = stats.officeDays;
        if (vacationDaysSpan) vacationDaysSpan.textContent = stats.vacationDays;

        const warningMessage = document.getElementById('warningMessage');
        const warningText = document.getElementById('warningText');
        if (warningMessage && warningText) {
            if (stats.homeofficePercent > rule) {
                warningMessage.style.display = 'block';
                warningText.textContent = `Die ${rule}%-HomeOffice-Regel wird überschritten!`;
            } else {
                warningMessage.style.display = 'none';
            }
        }
    }

    calculateMonthlyStats(colleague) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        let homeofficeDays = 0;
        let officeDays = 0;
        let vacationDays = 0;
        let azDays = 0;
        let totalWorkDays = 0;

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

    // Additional teamleader methods
    switchTab(tabName) {
        this.activeTab = tabName;
        
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
        
        switch(tabName) {
            case 'overview':
                this.renderTeamOverview();
                break;
            case 'details':
                this.populateDetailColleagueSelect();
                break;
            case 'reports':
                this.generateReportPreview();
                break;
        }
    }

    populateDetailColleagueSelect() {
        const select = document.getElementById('detailColleagueSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Kollege auswählen --</option>';
        
        this.colleagues.forEach(colleague => {
            const option = document.createElement('option');
            option.value = colleague;
            option.textContent = colleague;
            select.appendChild(option);
        });
    }

    renderTeamOverview() {
        const container = document.getElementById('teamOverviewTable');
        const statusFilter = document.getElementById('statusFilter');
        if (!container) return;
        
        const filterValue = statusFilter ? statusFilter.value : 'all';
        
        const table = document.createElement('table');
        table.className = 'overview-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>HomeOffice-Regel</th>
                    <th>Aktuelle Quote</th>
                    <th>Status</th>
                    <th>HomeOffice Tage</th>
                    <th>Büro Tage</th>
                    <th>Urlaub Tage</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        this.colleagues.forEach(colleague => {
            const stats = this.calculateMonthlyStats(colleague);
            const rule = this.homeofficeRules[colleague] || 40;
            
            if (filterValue === 'violations' && stats.homeofficePercent <= rule) return;
            if (filterValue === '40' && rule !== 40) return;
            if (filterValue === '60' && rule !== 60) return;
            
            const row = document.createElement('tr');
            
            let statusClass = 'status-ok';
            let statusText = 'OK';
            
            if (stats.homeofficePercent > rule) {
                statusClass = 'status-danger';
                statusText = 'Überschreitung';
            }
            
            row.innerHTML = `
                <td><strong>${colleague}</strong></td>
                <td>${rule}%</td>
                <td>${stats.homeofficePercent.toFixed(1)}%</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${stats.homeofficeDays}</td>
                <td>${stats.officeDays}</td>
                <td>${stats.vacationDays}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    showColleagueDetail(colleagueName) {
        const detailContainer = document.getElementById('colleagueDetail');
        if (!detailContainer || !colleagueName) {
            if (detailContainer) detailContainer.classList.add('hidden');
            return;
        }
        
        const stats = this.calculateMonthlyStats(colleagueName);
        const rule = this.homeofficeRules[colleagueName] || 40;
        
        detailContainer.innerHTML = `
            <h4>${colleagueName} - Detailansicht</h4>
            <div class="detail-stats">
                <div class="detail-stat-card">
                    <h5>HomeOffice Regel</h5>
                    <div class="stat-value">${rule}%</div>
                </div>
                <div class="detail-stat-card">
                    <h5>HomeOffice Quote</h5>
                    <div class="stat-value ${stats.homeofficePercent > rule ? 'status-warning' : 'status-ok'}">
                        ${stats.homeofficePercent.toFixed(1)}%
                    </div>
                </div>
                <div class="detail-stat-card">
                    <h5>HomeOffice Tage</h5>
                    <div class="stat-value">${stats.homeofficeDays}</div>
                </div>
                <div class="detail-stat-card">
                    <h5>Büro Tage</h5>
                    <div class="stat-value">${stats.officeDays}</div>
                </div>
                <div class="detail-stat-card">
                    <h5>Urlaub Tage</h5>
                    <div class="stat-value">${stats.vacationDays}</div>
                </div>
                <div class="detail-stat-card">
                    <h5>Gesamt Arbeitstage</h5>
                    <div class="stat-value">${stats.totalWorkDays}</div>
                </div>
            </div>
            <div class="detail-actions">
                <button class="btn btn--warning btn--sm" onclick="window.planner.showResetPasswordModal('${colleagueName}')">
                    Passwort zurücksetzen
                </button>
                <button class="btn btn--danger btn--sm" onclick="window.planner.showDeleteColleagueModal('${colleagueName}')">
                    Kollegen löschen
                </button>
            </div>
        `;
        
        detailContainer.classList.remove('hidden');
    }

    showResetPasswordModal(colleague) {
        this.selectedColleagueForAction = colleague;
        const modal = document.getElementById('resetPasswordModal');
        const colleagueSpan = document.getElementById('resetPasswordColleague');
        
        if (colleagueSpan) colleagueSpan.textContent = colleague;
        if (modal) modal.classList.remove('hidden');
    }

    hideResetPasswordModal() {
        const modal = document.getElementById('resetPasswordModal');
        if (modal) modal.classList.add('hidden');
        this.selectedColleagueForAction = null;
    }

    async resetColleaguePassword() {
        if (!this.selectedColleagueForAction) return;

        const newHashedPassword = await this.sha256Hash(this.newPasswordDefault);
        this.colleaguePasswords[this.selectedColleagueForAction] = newHashedPassword;
        
        // Save to Firebase
        await this.saveUserProfile(this.selectedColleagueForAction, {
            role: 'employee',
            quota: this.homeofficeRules[this.selectedColleagueForAction],
            passwordHash: newHashedPassword
        });
        
        this.hideResetPasswordModal();
        alert(`Passwort für ${this.selectedColleagueForAction} wurde auf "${this.newPasswordDefault}" zurückgesetzt.`);
    }

    showDeleteColleagueModal(colleague) {
        this.selectedColleagueForAction = colleague;
        const modal = document.getElementById('deleteColleagueModal');
        const nameSpan = document.getElementById('deleteColleagueName');
        
        if (nameSpan) nameSpan.textContent = colleague;
        if (modal) modal.classList.remove('hidden');
    }

    hideDeleteColleagueModal() {
        const modal = document.getElementById('deleteColleagueModal');
        if (modal) modal.classList.add('hidden');
        this.selectedColleagueForAction = null;
    }

    async deleteColleague() {
        if (!this.selectedColleagueForAction) return;

        const colleague = this.selectedColleagueForAction;
        
        const index = this.colleagues.indexOf(colleague);
        if (index > -1) {
            this.colleagues.splice(index, 1);
        }

        delete this.planningData[colleague];
        delete this.colleaguePasswords[colleague];
        delete this.homeofficeRules[colleague];

        // Remove from Firebase
        const uid = this.getUserUID(colleague);
        await this.removeData(`users/${uid}`);
        await this.removeData(`plans/${uid}`);

        this.populateDetailColleagueSelect();
        this.renderTeamOverview();
        
        const detailSelect = document.getElementById('detailColleagueSelect');
        if (detailSelect && detailSelect.value === colleague) {
            detailSelect.value = '';
            this.showColleagueDetail('');
        }

        this.hideDeleteColleagueModal();
        alert(`Kollege ${colleague} wurde erfolgreich gelöscht.`);
    }

    generateReportPreview() {
        const container = document.getElementById('reportPreview');
        if (!container) return;
        
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        
        const currentMonth = monthNames[this.currentDate.getMonth()];
        const currentYear = this.currentDate.getFullYear();
        
        let report = `HomeOffice Monatsbericht - ${currentMonth} ${currentYear}\n`;
        report += `====================================================\n\n`;
        
        this.colleagues.forEach(colleague => {
            const stats = this.calculateMonthlyStats(colleague);
            const rule = this.homeofficeRules[colleague] || 40;
            
            report += `${colleague}:\n`;
            report += `  HomeOffice-Regel: ${rule}%\n`;
            report += `  HomeOffice-Quote: ${stats.homeofficePercent.toFixed(1)}%\n`;
            report += `  HomeOffice Tage: ${stats.homeofficeDays}\n`;
            report += `  Büro Tage: ${stats.officeDays}\n`;
            report += `  Urlaub Tage: ${stats.vacationDays}\n`;
            report += `  Status: ${stats.homeofficePercent > rule ? 'ÜBERSCHREITUNG' : 'OK'}\n\n`;
        });
        
        const totalViolations = this.colleagues.filter(colleague => {
            const stats = this.calculateMonthlyStats(colleague);
            const rule = this.homeofficeRules[colleague] || 40;
            return stats.homeofficePercent > rule;
        }).length;
        
        report += `Zusammenfassung:\n`;
        report += `- Anzahl Kollegen: ${this.colleagues.length}\n`;
        report += `- Überschreitungen: ${totalViolations}\n`;
        report += `- Bericht erstellt: ${new Date().toLocaleString('de-DE')}\n`;
        
        container.textContent = report;
    }

    exportMonthReport() {
        this.generateReportPreview();
        const reportContent = document.getElementById('reportPreview').textContent;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        
        const fileName = `HomeOffice-Bericht-${monthNames[this.currentDate.getMonth()]}-${this.currentDate.getFullYear()}.txt`;
        
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Firebase-enabled planner...');
    window.planner = new HomeOfficePlanner();
    window.planner.init().catch(error => {
        console.error('Failed to initialize app:', error);
    });
});
