// HomeOffice-Planer - Complete App Logic
class HomeOfficePlaner {
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

        // Current user data
        this.currentUser = null;
        this.currentDate = new Date();
        this.currentMonth = new Date();

        // Holidays 2025-2030
        this.holidays = this.generateHolidays();

        // PWA Install prompt
        this.deferredPrompt = null;

        this.initializeFirebase();
    }

    initializeFirebase() {
        try {
            // Initialize Firebase only if not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            this.db = firebase.database();
            this.auth = firebase.auth();
            console.log('Firebase initialized successfully');
            this.init();
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            // Continue without Firebase for testing
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.setupPWAInstall();
        this.renderCalendar();
        console.log('HomeOffice-Planer initialized');
    }

    setupEventListeners() {
        // Login buttons
        document.getElementById('kollegeBtn').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Kollege button clicked');
            this.showPasswordModal('kollege');
        });
        
        document.getElementById('teamleiterBtn').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Teamleiter button clicked');
            this.showPasswordModal('teamleiter');
        });
        
        document.getElementById('neuerKollegeBtn').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Neuer Kollege button clicked');
            this.showRegistrationModal();
        });

        // Password modal
        document.getElementById('passwordSubmitBtn').addEventListener('click', () => this.handlePasswordSubmit());
        document.getElementById('passwordCancelBtn').addEventListener('click', () => this.hideModal('passwordModal'));
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handlePasswordSubmit();
        });

        // Registration modal
        document.getElementById('registerSubmitBtn').addEventListener('click', () => this.handleRegistration());
        document.getElementById('registerCancelBtn').addEventListener('click', () => this.hideModal('registrationModal'));

        // Header actions
        document.getElementById('passwordChangeBtn').addEventListener('click', () => this.showModal('passwordChangeModal'));
        document.getElementById('accountDeleteBtn').addEventListener('click', () => this.showModal('accountDeleteModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Password change modal
        document.getElementById('passwordChangeSubmitBtn').addEventListener('click', () => this.handlePasswordChange());
        document.getElementById('passwordChangeCancelBtn').addEventListener('click', () => this.hideModal('passwordChangeModal'));

        // Account delete modal
        document.getElementById('accountDeleteConfirmBtn').addEventListener('click', () => this.handleAccountDelete());
        document.getElementById('accountDeleteCancelBtn').addEventListener('click', () => this.hideModal('accountDeleteModal'));

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));

        // Quota rule change
        document.getElementById('quotaRule').addEventListener('change', () => this.updateQuotaDisplay());

        // Team leader functions
        const resetColleagueBtn = document.getElementById('resetColleagueBtn');
        if (resetColleagueBtn) {
            resetColleagueBtn.addEventListener('click', () => this.showModal('resetColleagueModal'));
        }
        
        const resetColleagueConfirmBtn = document.getElementById('resetColleagueConfirmBtn');
        if (resetColleagueConfirmBtn) {
            resetColleagueConfirmBtn.addEventListener('click', () => this.handleColleagueReset());
        }
        
        const resetColleagueCancelBtn = document.getElementById('resetColleagueCancelBtn');
        if (resetColleagueCancelBtn) {
            resetColleagueCancelBtn.addEventListener('click', () => this.hideModal('resetColleagueModal'));
        }

        console.log('Event listeners set up successfully');
    }

    setupPWAInstall() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('installPrompt').classList.remove('hidden');
        });

        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then(() => {
                        this.deferredPrompt = null;
                        document.getElementById('installPrompt').classList.add('hidden');
                    });
                }
            });
        }

        const dismissInstallBtn = document.getElementById('dismissInstallBtn');
        if (dismissInstallBtn) {
            dismissInstallBtn.addEventListener('click', () => {
                document.getElementById('installPrompt').classList.add('hidden');
            });
        }
    }

    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Password hashing failed:', error);
            return password; // Fallback for testing
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            console.log('Showing modal:', modalId);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            // Clear form inputs
            const inputs = modal.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            console.log('Hiding modal:', modalId);
        }
    }

    showPasswordModal(userType) {
        this.pendingUserType = userType;
        document.getElementById('passwordModalTitle').textContent = 
            userType === 'kollege' ? 'Kollege Anmeldung' : 'Teamleiter Anmeldung';
        this.showModal('passwordModal');
        setTimeout(() => {
            document.getElementById('passwordInput').focus();
        }, 100);
    }

    showRegistrationModal() {
        this.showModal('registrationModal');
        setTimeout(() => {
            document.getElementById('newColleagueName').focus();
        }, 100);
    }

    async handlePasswordSubmit() {
        const password = document.getElementById('passwordInput').value;
        if (!password) {
            alert('Bitte Passwort eingeben');
            return;
        }

        console.log('Attempting login for:', this.pendingUserType);
        
        const hashedPassword = await this.hashPassword(password);
        
        try {
            if (this.pendingUserType === 'kollege') {
                await this.loginKollege(hashedPassword, password);
            } else if (this.pendingUserType === 'teamleiter') {
                await this.loginTeamleiter(hashedPassword, password);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Anmeldung fehlgeschlagen: ' + error.message);
        }
    }

    async loginKollege(hashedPassword, originalPassword) {
        try {
            if (this.db) {
                const snapshot = await this.db.ref('users').once('value');
                const users = snapshot.val() || {};
                
                let foundUser = null;
                for (const [userId, userData] of Object.entries(users)) {
                    if (userData.password === hashedPassword && userData.role === 'kollege') {
                        foundUser = { id: userId, ...userData };
                        break;
                    }
                }

                if (foundUser) {
                    this.currentUser = foundUser;
                    this.hideModal('passwordModal');
                    this.showAppScreen();
                    return;
                }
            }
            
            // Demo mode fallback for testing
            if (originalPassword === 'demo' || originalPassword === 'kollege') {
                this.currentUser = {
                    id: 'demo_kollege',
                    name: 'Demo Kollege',
                    role: 'kollege',
                    password: hashedPassword,
                    quotaRule: 40
                };
                this.hideModal('passwordModal');
                this.showAppScreen();
                return;
            }
            
            throw new Error('Ungültiges Passwort oder Benutzer nicht gefunden');
        } catch (error) {
            console.error('Kollege login error:', error);
            throw error;
        }
    }

    async loginTeamleiter(hashedPassword, originalPassword) {
        try {
            if (this.db) {
                const snapshot = await this.db.ref('users').once('value');
                const users = snapshot.val() || {};
                
                let foundUser = null;
                for (const [userId, userData] of Object.entries(users)) {
                    if (userData.password === hashedPassword && userData.role === 'teamleiter') {
                        foundUser = { id: userId, ...userData };
                        break;
                    }
                }

                if (foundUser) {
                    this.currentUser = foundUser;
                    this.hideModal('passwordModal');
                    this.showAppScreen();
                    return;
                }
            }
            
            // Demo mode fallback for testing
            if (originalPassword === 'demo' || originalPassword === 'teamleiter') {
                this.currentUser = {
                    id: 'demo_teamleiter',
                    name: 'Demo Teamleiter',
                    role: 'teamleiter',
                    password: hashedPassword,
                    quotaRule: 40
                };
                this.hideModal('passwordModal');
                this.showAppScreen();
                return;
            }
            
            throw new Error('Ungültiges Passwort oder Benutzer nicht gefunden');
        } catch (error) {
            console.error('Teamleiter login error:', error);
            throw error;
        }
    }

    async handleRegistration() {
        const name = document.getElementById('newColleagueName').value.trim();
        const password = document.getElementById('newColleaguePassword').value;
        const passwordConfirm = document.getElementById('newColleaguePasswordConfirm').value;

        if (!name || !password || !passwordConfirm) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        if (password !== passwordConfirm) {
            alert('Passwörter stimmen nicht überein');
            return;
        }

        if (password.length < 3) {
            alert('Passwort muss mindestens 3 Zeichen lang sein');
            return;
        }

        try {
            const hashedPassword = await this.hashPassword(password);
            const userId = 'user_' + Date.now();
            
            const userData = {
                name: name,
                password: hashedPassword,
                role: 'kollege',
                quotaRule: 40,
                createdAt: new Date().toISOString()
            };

            if (this.db) {
                await this.db.ref(`users/${userId}`).set(userData);
            }
            
            this.currentUser = { id: userId, ...userData };
            this.hideModal('registrationModal');
            this.showAppScreen();
            
            console.log('User registered successfully:', userData);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registrierung fehlgeschlagen: ' + error.message);
        }
    }

    async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            alert('Neue Passwörter stimmen nicht überein');
            return;
        }

        if (newPassword.length < 3) {
            alert('Neues Passwort muss mindestens 3 Zeichen lang sein');
            return;
        }

        try {
            const currentHashed = await this.hashPassword(currentPassword);
            if (currentHashed !== this.currentUser.password) {
                alert('Aktuelles Passwort ist falsch');
                return;
            }

            const newHashed = await this.hashPassword(newPassword);
            
            if (this.db) {
                await this.db.ref(`users/${this.currentUser.id}/password`).set(newHashed);
            }
            
            this.currentUser.password = newHashed;
            this.hideModal('passwordChangeModal');
            alert('Passwort erfolgreich geändert');
        } catch (error) {
            console.error('Password change error:', error);
            alert('Passwort ändern fehlgeschlagen: ' + error.message);
        }
    }

    async handleAccountDelete() {
        const password = document.getElementById('deleteAccountPassword').value;
        
        if (!password) {
            alert('Bitte Passwort eingeben');
            return;
        }

        try {
            const hashedPassword = await this.hashPassword(password);
            if (hashedPassword !== this.currentUser.password) {
                alert('Passwort ist falsch');
                return;
            }

            if (confirm('Sind Sie wirklich sicher? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                if (this.db) {
                    await this.db.ref(`users/${this.currentUser.id}`).remove();
                    await this.db.ref(`schedules/${this.currentUser.id}`).remove();
                }
                
                this.logout();
                alert('Account wurde gelöscht');
            }
        } catch (error) {
            console.error('Account delete error:', error);
            alert('Account löschen fehlgeschlagen: ' + error.message);
        }
    }

    async handleColleagueReset() {
        const colleagueId = document.getElementById('resetColleagueSelect').value;
        
        if (!colleagueId) {
            alert('Bitte Kollege auswählen');
            return;
        }

        if (confirm('Alle Daten des Kollegen werden zurückgesetzt. Fortfahren?')) {
            try {
                if (this.db) {
                    await this.db.ref(`schedules/${colleagueId}`).remove();
                    await this.db.ref(`users/${colleagueId}/quotaRule`).set(40);
                }
                
                this.hideModal('resetColleagueModal');
                alert('Kollege wurde zurückgesetzt');
                this.loadTeamOverview();
            } catch (error) {
                console.error('Colleague reset error:', error);
                alert('Zurücksetzen fehlgeschlagen: ' + error.message);
            }
        }
    }

    showAppScreen() {
        console.log('Showing app screen for user:', this.currentUser);
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        document.getElementById('headerActions').style.display = 'flex';
        
        // Update user info
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = 
            this.currentUser.role === 'teamleiter' ? 'Teamleiter' : 'Kollege';

        // Show/hide team tab based on role
        const teamNavTab = document.getElementById('teamNavTab');
        if (teamNavTab) {
            if (this.currentUser.role === 'teamleiter') {
                teamNavTab.style.display = 'block';
            } else {
                teamNavTab.style.display = 'none';
            }
        }

        // Load user's quota rule
        const quotaRule = document.getElementById('quotaRule');
        if (quotaRule) {
            quotaRule.value = this.currentUser.quotaRule || 40;
        }
        
        this.renderCalendar();
        this.updateQuotaDisplay();
    }

    logout() {
        console.log('Logging out user');
        this.currentUser = null;
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appScreen').classList.add('hidden');
        document.getElementById('headerActions').style.display = 'none';
        
        // Reset to calendar tab
        this.switchTab('calendar');
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden');
        });
        
        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.classList.remove('hidden');
        }

        if (tabName === 'team') {
            this.loadTeamOverview();
        }
    }

    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
        this.updateQuotaDisplay();
    }

    renderCalendar() {
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];

        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.textContent = 
                `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
        }

        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            const dateStr = this.formatDate(currentDate);
            
            // Add classes
            if (currentDate.getMonth() !== this.currentMonth.getMonth()) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(currentDate)) {
                dayElement.classList.add('today');
            }
            
            if (this.isWeekend(currentDate)) {
                dayElement.classList.add('weekend');
            }
            
            if (this.isHoliday(currentDate)) {
                dayElement.classList.add('holiday');
            }
            
            // Load schedule status
            if (this.currentUser && currentDate.getMonth() === this.currentMonth.getMonth()) {
                this.loadDayStatus(dateStr, dayElement);
            }
            
            // Add click handler for current month workdays only
            if (currentDate.getMonth() === this.currentMonth.getMonth() && 
                !this.isWeekend(currentDate) && 
                !this.isHoliday(currentDate)) {
                dayElement.style.cursor = 'pointer';
                dayElement.addEventListener('click', () => this.toggleDayStatus(dateStr, dayElement));
            }
            
            calendarDays.appendChild(dayElement);
        }
    }

    async loadDayStatus(dateStr, dayElement) {
        try {
            // Use local storage as fallback if Firebase is not available
            if (this.db) {
                const snapshot = await this.db.ref(`schedules/${this.currentUser.id}/${dateStr}`).once('value');
                const status = snapshot.val();
                
                if (status === 'homeoffice') {
                    dayElement.classList.add('homeoffice');
                } else if (status === 'office') {
                    dayElement.classList.add('office');
                }
            } else {
                // Local fallback
                const localData = JSON.parse(localStorage.getItem(`schedule_${this.currentUser.id}`) || '{}');
                const status = localData[dateStr];
                
                if (status === 'homeoffice') {
                    dayElement.classList.add('homeoffice');
                } else if (status === 'office') {
                    dayElement.classList.add('office');
                }
            }
        } catch (error) {
            console.error('Error loading day status:', error);
        }
    }

    async toggleDayStatus(dateStr, dayElement) {
        if (!this.currentUser) return;
        
        let newStatus = '';
        if (dayElement.classList.contains('homeoffice')) {
            newStatus = 'office';
        } else if (dayElement.classList.contains('office')) {
            newStatus = '';
        } else {
            newStatus = 'homeoffice';
        }
        
        try {
            if (this.db) {
                if (newStatus) {
                    await this.db.ref(`schedules/${this.currentUser.id}/${dateStr}`).set(newStatus);
                } else {
                    await this.db.ref(`schedules/${this.currentUser.id}/${dateStr}`).remove();
                }
            } else {
                // Local fallback
                const localData = JSON.parse(localStorage.getItem(`schedule_${this.currentUser.id}`) || '{}');
                if (newStatus) {
                    localData[dateStr] = newStatus;
                } else {
                    delete localData[dateStr];
                }
                localStorage.setItem(`schedule_${this.currentUser.id}`, JSON.stringify(localData));
            }
            
            // Update UI
            dayElement.classList.remove('homeoffice', 'office');
            if (newStatus) {
                dayElement.classList.add(newStatus);
            }
            
            this.updateQuotaDisplay();
        } catch (error) {
            console.error('Error saving day status:', error);
            alert('Fehler beim Speichern: ' + error.message);
        }
    }

    async updateQuotaDisplay() {
        if (!this.currentUser) return;
        
        const quotaRule = parseInt(document.getElementById('quotaRule').value);
        
        // Save quota rule
        if (quotaRule !== this.currentUser.quotaRule) {
            this.currentUser.quotaRule = quotaRule;
            if (this.db) {
                try {
                    await this.db.ref(`users/${this.currentUser.id}/quotaRule`).set(quotaRule);
                } catch (error) {
                    console.error('Error saving quota rule:', error);
                }
            }
        }
        
        try {
            let schedules = {};
            
            if (this.db) {
                const snapshot = await this.db.ref(`schedules/${this.currentUser.id}`).once('value');
                schedules = snapshot.val() || {};
            } else {
                // Local fallback
                schedules = JSON.parse(localStorage.getItem(`schedule_${this.currentUser.id}`) || '{}');
            }
            
            const currentYear = this.currentMonth.getFullYear();
            const currentMonthNum = this.currentMonth.getMonth();
            
            let homeOfficeDays = 0;
            let officeDays = 0;
            let totalWorkDays = 0;
            
            // Count days in current month
            const firstDay = new Date(currentYear, currentMonthNum, 1);
            const lastDay = new Date(currentYear, currentMonthNum + 1, 0);
            
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(currentYear, currentMonthNum, day);
                const dateStr = this.formatDate(date);
                
                if (!this.isWeekend(date) && !this.isHoliday(date)) {
                    totalWorkDays++;
                    const status = schedules[dateStr];
                    if (status === 'homeoffice') {
                        homeOfficeDays++;
                    } else if (status === 'office') {
                        officeDays++;
                    }
                }
            }
            
            const percentage = totalWorkDays > 0 ? Math.round((homeOfficeDays / totalWorkDays) * 100) : 0;
            
            document.getElementById('homeOfficeDays').textContent = homeOfficeDays;
            document.getElementById('officeDays').textContent = officeDays;
            
            const quotaElement = document.getElementById('quotaPercentage');
            quotaElement.textContent = percentage + '%';
            
            // Color coding
            quotaElement.classList.remove('status--success', 'status--warning', 'status--error');
            if (percentage <= quotaRule) {
                quotaElement.classList.add('status--success');
            } else if (percentage <= quotaRule + 10) {
                quotaElement.classList.add('status--warning');
            } else {
                quotaElement.classList.add('status--error');
            }
        } catch (error) {
            console.error('Error updating quota display:', error);
        }
    }

    async loadTeamOverview() {
        if (this.currentUser.role !== 'teamleiter') return;
        
        try {
            let users = {};
            let schedules = {};
            
            if (this.db) {
                const usersSnapshot = await this.db.ref('users').once('value');
                users = usersSnapshot.val() || {};
                
                const schedulesSnapshot = await this.db.ref('schedules').once('value');
                schedules = schedulesSnapshot.val() || {};
            } else {
                // Demo data for testing
                users = {
                    'demo_kollege_1': { name: 'Demo Kollege 1', role: 'kollege', quotaRule: 40 },
                    'demo_kollege_2': { name: 'Demo Kollege 2', role: 'kollege', quotaRule: 60 }
                };
            }
            
            const teamList = document.getElementById('teamList');
            if (!teamList) return;
            
            teamList.innerHTML = '';
            
            // Show team controls
            const teamControls = document.getElementById('teamControls');
            if (teamControls) {
                teamControls.style.display = 'block';
            }
            
            // Populate reset dropdown
            const resetSelect = document.getElementById('resetColleagueSelect');
            if (resetSelect) {
                resetSelect.innerHTML = '<option value="">Kollege wählen...</option>';
            }
            
            for (const [userId, userData] of Object.entries(users)) {
                if (userData.role === 'kollege') {
                    if (resetSelect) {
                        const option = document.createElement('option');
                        option.value = userId;
                        option.textContent = userData.name;
                        resetSelect.appendChild(option);
                    }
                    
                    const memberElement = this.createTeamMemberElement(userId, userData, schedules[userId] || {});
                    teamList.appendChild(memberElement);
                }
            }
        } catch (error) {
            console.error('Error loading team overview:', error);
        }
    }

    createTeamMemberElement(userId, userData, userSchedules) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        
        // Calculate stats for current month
        const currentYear = this.currentMonth.getFullYear();
        const currentMonthNum = this.currentMonth.getMonth();
        
        let homeOfficeDays = 0;
        let officeDays = 0;
        let totalWorkDays = 0;
        
        const firstDay = new Date(currentYear, currentMonthNum, 1);
        const lastDay = new Date(currentYear, currentMonthNum + 1, 0);
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear, currentMonthNum, day);
            const dateStr = this.formatDate(date);
            
            if (!this.isWeekend(date) && !this.isHoliday(date)) {
                totalWorkDays++;
                const status = userSchedules[dateStr];
                if (status === 'homeoffice') {
                    homeOfficeDays++;
                } else if (status === 'office') {
                    officeDays++;
                }
            }
        }
        
        const percentage = totalWorkDays > 0 ? Math.round((homeOfficeDays / totalWorkDays) * 100) : 0;
        const quotaRule = userData.quotaRule || 40;
        
        memberDiv.innerHTML = `
            <div class="team-member-header">
                <h4 class="team-member-name">${userData.name}</h4>
                <span class="status ${this.getQuotaStatusClass(percentage, quotaRule)}">${percentage}%</span>
            </div>
            <div class="team-member-stats">
                <div class="team-member-stat">
                    <span class="team-member-stat-label">HO-Tage</span>
                    <span class="team-member-stat-value">${homeOfficeDays}</span>
                </div>
                <div class="team-member-stat">
                    <span class="team-member-stat-label">Büro-Tage</span>
                    <span class="team-member-stat-value">${officeDays}</span>
                </div>
                <div class="team-member-stat">
                    <span class="team-member-stat-label">Regel</span>
                    <span class="team-member-stat-value">${quotaRule}%</span>
                </div>
            </div>
            <div class="mini-calendar" id="miniCalendar_${userId}"></div>
        `;
        
        // Render mini calendar
        setTimeout(() => {
            this.renderMiniCalendar(userId, userSchedules);
        }, 0);
        
        return memberDiv;
    }

    renderMiniCalendar(userId, userSchedules) {
        const container = document.getElementById(`miniCalendar_${userId}`);
        if (!container) return;
        
        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
        
        // Add headers
        const headers = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        headers.forEach(header => {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'mini-calendar-header';
            headerDiv.textContent = header;
            container.appendChild(headerDiv);
        });
        
        // Add days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'mini-calendar-day';
            dayDiv.textContent = currentDate.getDate();
            
            const dateStr = this.formatDate(currentDate);
            
            if (currentDate.getMonth() !== this.currentMonth.getMonth()) {
                dayDiv.style.opacity = '0.3';
            }
            
            if (this.isWeekend(currentDate)) {
                dayDiv.classList.add('weekend');
            } else if (this.isHoliday(currentDate)) {
                dayDiv.classList.add('holiday');
            } else {
                const status = userSchedules[dateStr];
                if (status === 'homeoffice') {
                    dayDiv.classList.add('homeoffice');
                } else if (status === 'office') {
                    dayDiv.classList.add('office');
                }
            }
            
            container.appendChild(dayDiv);
        }
    }

    getQuotaStatusClass(percentage, quotaRule) {
        if (percentage <= quotaRule) {
            return 'status--success';
        } else if (percentage <= quotaRule + 10) {
            return 'status--warning';
        } else {
            return 'status--error';
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    isHoliday(date) {
        const dateStr = this.formatDate(date);
        return this.holidays.includes(dateStr);
    }

    generateHolidays() {
        const holidays = [];
        
        // Holidays 2025-2030
        const years = [2025, 2026, 2027, 2028, 2029, 2030];
        
        years.forEach(year => {
            // Fixed holidays
            holidays.push(`${year}-01-01`); // Neujahr
            holidays.push(`${year}-05-01`); // Tag der Arbeit
            holidays.push(`${year}-10-03`); // Tag der Deutschen Einheit
            holidays.push(`${year}-12-25`); // 1. Weihnachtstag
            holidays.push(`${year}-12-26`); // 2. Weihnachtstag
            
            // Easter dependent holidays
            const easter = this.calculateEaster(year);
            holidays.push(this.formatDate(new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000))); // Karfreitag
            holidays.push(this.formatDate(new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000))); // Ostermontag
            holidays.push(this.formatDate(new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000))); // Christi Himmelfahrt
            holidays.push(this.formatDate(new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000))); // Pfingstmontag
        });
        
        return holidays;
    }

    calculateEaster(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing HomeOffice-Planer');
    window.homeOfficePlaner = new HomeOfficePlaner();
});