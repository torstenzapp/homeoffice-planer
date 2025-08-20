// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, get, push, remove, onValue, off } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
    authDomain: "homeoffice-planer-drv.firebaseapp.com",
    databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "homeoffice-planer-drv",
    storageBucket: "homeoffice-planer-drv.firebasestorage.app",
    messagingSenderId: "669565818222",
    appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Application State
let currentUser = null;
let currentDate = new Date();
let selectedDate = null;
let connectionStatus = true;

// Status Types Configuration
const statusTypes = {
    homeoffice: { name: "Home-Office", color: "#FF8C00", symbol: "🏠" },
    buero: { name: "Büro", color: "#4169E1", symbol: "🏢" },
    urlaub: { name: "Urlaub", color: "#32CD32", symbol: "🏖️" },
    az: { name: "AZ", color: "#808080", symbol: "⏰" }
};

// German Holidays 2025-2030
const holidays = {
    2025: [
        { datum: "2025-01-01", name: "Neujahr" },
        { datum: "2025-04-18", name: "Karfreitag" },
        { datum: "2025-04-21", name: "Ostermontag" },
        { datum: "2025-05-01", name: "Tag der Arbeit" },
        { datum: "2025-05-29", name: "Christi Himmelfahrt" },
        { datum: "2025-06-09", name: "Pfingstmontag" },
        { datum: "2025-06-19", name: "Fronleichnam" },
        { datum: "2025-08-15", name: "Mariä Himmelfahrt" },
        { datum: "2025-10-03", name: "Tag der Deutschen Einheit" },
        { datum: "2025-11-01", name: "Allerheiligen" },
        { datum: "2025-12-25", name: "1. Weihnachtsfeiertag" },
        { datum: "2025-12-26", name: "2. Weihnachtsfeiertag" }
    ]
};

// Security Functions
async function hashPassword(password, salt = null) {
    if (!salt) {
        salt = crypto.getRandomValues(new Uint8Array(16));
    } else if (typeof salt === 'string') {
        salt = new Uint8Array(salt.split(',').map(x => parseInt(x)));
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + Array.from(salt).join(''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return {
        hash: hashArray.join(','),
        salt: Array.from(salt).join(',')
    };
}

async function verifyPassword(password, storedHash, storedSalt) {
    const { hash } = await hashPassword(password, storedSalt);
    return hash === storedHash;
}

// Utility Functions
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('hidden');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (notification && text) {
        text.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}

function showLoading() {
    showElement('loadingSpinner');
}

function hideLoading() {
    hideElement('loadingSpinner');
}

// Date Utility Functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getMonthName(date) {
    const months = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Convert Sunday=0 to Monday=0
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

function isHoliday(date) {
    const dateString = formatDate(date);
    const year = date.getFullYear();
    if (holidays[year]) {
        return holidays[year].some(holiday => holiday.datum === dateString);
    }
    return false;
}

function getHolidayName(date) {
    const dateString = formatDate(date);
    const year = date.getFullYear();
    if (holidays[year]) {
        const holiday = holidays[year].find(h => h.datum === dateString);
        return holiday ? holiday.name : null;
    }
    return null;
}

// Authentication Functions - Made globally available
function showUserTypeSelection() {
    console.log('showUserTypeSelection called');
    showElement('userTypeSelection');
    hideElement('employeeLogin');
    hideElement('teamleaderLogin');
    hideElement('registerForm');
}

function showLogin(type) {
    console.log('showLogin called with type:', type);
    hideElement('userTypeSelection');
    
    if (type === 'employee') {
        showElement('employeeLogin');
        hideElement('teamleaderLogin');
        hideElement('registerForm');
    } else if (type === 'teamleader') {
        showElement('teamleaderLogin');
        hideElement('employeeLogin');
        hideElement('registerForm');
    } else if (type === 'register') {
        showElement('registerForm');
        hideElement('employeeLogin');
        hideElement('teamleaderLogin');
    }
}

async function authenticateEmployee(name, password) {
    showLoading();
    try {
        const userRef = ref(database, `users/${name}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const isValid = await verifyPassword(password, userData.passwordHash, userData.salt);
            
            if (isValid) {
                currentUser = {
                    id: name,
                    name: name,
                    role: 'employee',
                    quota: userData.quota || 40
                };
                showMainApp();
                showNotification('Erfolgreich angemeldet!');
            } else {
                showNotification('Falsches Passwort!', 'error');
            }
        } else {
            showNotification('Benutzer nicht gefunden!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Fehler bei der Anmeldung!', 'error');
    }
    hideLoading();
}

async function authenticateTeamleader(password) {
    showLoading();
    if (password === 'teamleiter123') {
        currentUser = {
            id: 'teamleader',
            name: 'Teamleiter',
            role: 'teamleader',
            quota: 100
        };
        showMainApp();
        showNotification('Als Teamleiter angemeldet!');
    } else {
        showNotification('Falsches Teamleiter-Passwort!', 'error');
    }
    hideLoading();
}

async function registerUser(name, password) {
    showLoading();
    try {
        const userRef = ref(database, `users/${name}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            showNotification('Benutzername bereits vergeben!', 'error');
        } else {
            const { hash, salt } = await hashPassword(password);
            
            await set(userRef, {
                name: name,
                role: 'employee',
                quota: 40,
                passwordHash: hash,
                salt: salt,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
            
            currentUser = {
                id: name,
                name: name,
                role: 'employee',
                quota: 40
            };
            showMainApp();
            showNotification('Registrierung erfolgreich!');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Fehler bei der Registrierung!', 'error');
    }
    hideLoading();
}

function logout() {
    currentUser = null;
    hideElement('mainApp');
    showElement('loginScreen');
    showUserTypeSelection();
    showNotification('Erfolgreich abgemeldet!');
}

function showMainApp() {
    hideElement('loginScreen');
    showElement('mainApp');
    
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    if (currentUser.role === 'teamleader') {
        showElement('teamleaderNav');
        showElement('teamleaderContent');
        hideElement('employeeDashboard');
        initTeamleaderView();
    } else {
        hideElement('teamleaderNav');
        hideElement('teamleaderContent');
        showElement('employeeDashboard');
        initEmployeeDashboard();
    }
}

// Calendar Functions
async function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('currentMonth');
    
    if (!calendar || !monthDisplay) return;
    
    monthDisplay.textContent = getMonthName(currentDate);
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day of month and days in month
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendar.appendChild(emptyDay);
    }
    
    // Load user's plans for this month
    let userPlans = {};
    if (currentUser && currentUser.role === 'employee') {
        try {
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            const plansRef = ref(database, `plans/${currentUser.id}/${monthKey}`);
            const snapshot = await get(plansRef);
            if (snapshot.exists()) {
                userPlans = snapshot.val();
            }
        } catch (error) {
            console.error('Error loading plans:', error);
        }
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);
        const dayElement = document.createElement('div');
        
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = dateString;
        
        // Check for weekend
        if (isWeekend(date)) {
            dayElement.classList.add('weekend');
        }
        
        // Check for holiday
        if (isHoliday(date)) {
            dayElement.classList.add('holiday');
            const holidayName = getHolidayName(date);
            dayElement.title = holidayName;
        }
        
        // Check for user status
        if (userPlans[dateString]) {
            dayElement.classList.add(`status-${userPlans[dateString]}`);
            dayElement.innerHTML = `${day}<br>${statusTypes[userPlans[dateString]].symbol}`;
        }
        
        // Add click handler for employee
        if (currentUser && currentUser.role === 'employee') {
            dayElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isWeekend(date) && !isHoliday(date)) {
                    selectedDate = dateString;
                    showStatusModal();
                }
            });
        }
        
        calendar.appendChild(dayElement);
    }
}

// Status Management
function showStatusModal() {
    console.log('showStatusModal called');
    showElement('statusModal');
}

function closeStatusModal() {
    console.log('closeStatusModal called');
    hideElement('statusModal');
    selectedDate = null;
}

async function setStatus(status) {
    console.log('setStatus called with:', status);
    if (!selectedDate || !currentUser || currentUser.role !== 'employee') return;
    
    showLoading();
    try {
        const date = new Date(selectedDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const planRef = ref(database, `plans/${currentUser.id}/${monthKey}/${selectedDate}`);
        
        if (status) {
            await set(planRef, status);
            showNotification(`Status auf ${statusTypes[status].name} gesetzt!`);
        } else {
            await remove(planRef);
            showNotification('Status entfernt!');
        }
        
        closeStatusModal();
        renderCalendar();
        updateDashboardStats();
    } catch (error) {
        console.error('Error setting status:', error);
        showNotification('Fehler beim Setzen des Status!', 'error');
    }
    hideLoading();
}

// Dashboard Functions
function initEmployeeDashboard() {
    renderCalendar();
    updateDashboardStats();
    
    // Set up quota setting
    const quotaSetting = document.getElementById('quotaSetting');
    if (quotaSetting) {
        quotaSetting.value = currentUser.quota;
    }
}

async function updateDashboardStats() {
    if (!currentUser || currentUser.role !== 'employee') return;
    
    try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        const plansRef = ref(database, `plans/${currentUser.id}/${monthKey}`);
        const snapshot = await get(plansRef);
        const plans = snapshot.exists() ? snapshot.val() : {};
        
        // Calculate statistics
        const daysInMonth = getDaysInMonth(currentDate);
        let workDays = 0;
        let homeofficeDays = 0;
        let officeDays = 0;
        let vacationDays = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            
            if (!isWeekend(date) && !isHoliday(date)) {
                workDays++;
                const dateString = formatDate(date);
                const status = plans[dateString];
                
                if (status === 'homeoffice') {
                    homeofficeDays++;
                } else if (status === 'buero') {
                    officeDays++;
                } else if (status === 'urlaub') {
                    vacationDays++;
                    workDays--; // Vacation days don't count as work days
                }
            }
        }
        
        // Update stats display
        const workDaysElement = document.getElementById('workDays');
        const homeofficeDaysElement = document.getElementById('homeofficeDays');
        const officeDaysElement = document.getElementById('officeDays');
        const vacationDaysElement = document.getElementById('vacationDays');
        
        if (workDaysElement) workDaysElement.textContent = workDays;
        if (homeofficeDaysElement) homeofficeDaysElement.textContent = homeofficeDays;
        if (officeDaysElement) officeDaysElement.textContent = officeDays;
        if (vacationDaysElement) vacationDaysElement.textContent = vacationDays;
        
        // Update quota display
        const quota = workDays > 0 ? (homeofficeDays / workDays * 100) : 0;
        const quotaLimit = currentUser.quota;
        
        const quotaPercentageElement = document.getElementById('quotaPercentage');
        const quotaLimitElement = document.getElementById('quotaLimit');
        
        if (quotaPercentageElement) quotaPercentageElement.textContent = `${Math.round(quota)}%`;
        if (quotaLimitElement) quotaLimitElement.textContent = quotaLimit;
        
        const quotaProgress = document.getElementById('quotaProgress');
        if (quotaProgress) {
            quotaProgress.style.width = `${Math.min(quota, 100)}%`;
            
            // Update quota bar color based on limit
            quotaProgress.className = 'quota-progress';
            if (quota > quotaLimit) {
                quotaProgress.classList.add('danger');
            } else if (quota > quotaLimit * 0.8) {
                quotaProgress.classList.add('warning');
            }
        }
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Teamleader Functions
function initTeamleaderView() {
    setupTeamleaderTabs();
    loadTeamOverview();
    loadEmployeeSelect();
    
    // Set default report month
    const now = new Date();
    const reportMonth = document.getElementById('reportMonth');
    if (reportMonth) {
        reportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}

function setupTeamleaderTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetTab = e.target.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Show/hide tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${targetTab}Tab`).classList.remove('hidden');
            
            // Load tab-specific content
            if (targetTab === 'overview') {
                loadTeamOverview();
            } else if (targetTab === 'details') {
                loadEmployeeSelect();
            }
        });
    });
}

async function loadTeamOverview() {
    const container = document.getElementById('teamOverview');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center">Lädt Team-Übersicht...</div>';
    
    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            container.innerHTML = '';
            
            for (const [userId, userData] of Object.entries(users)) {
                if (userData.role === 'employee') {
                    const memberCard = createTeamMemberCard(userId, userData);
                    container.appendChild(memberCard);
                }
            }
        } else {
            container.innerHTML = '<div class="text-center">Keine Mitarbeiter gefunden.</div>';
        }
    } catch (error) {
        console.error('Error loading team overview:', error);
        container.innerHTML = '<div class="text-center text-error">Fehler beim Laden der Team-Übersicht.</div>';
    }
}

function createTeamMemberCard(userId, userData) {
    const card = document.createElement('div');
    card.className = 'team-member-card';
    
    card.innerHTML = `
        <div class="team-member-header">
            <span class="team-member-name">${userData.name}</span>
            <div class="team-member-actions">
                <button class="btn btn--sm btn--secondary" data-action="reset" data-user="${userId}">
                    🔑 Passwort zurücksetzen
                </button>
                <button class="btn btn--sm btn--outline" style="color: var(--color-error); border-color: var(--color-error);" data-action="delete" data-user="${userId}">
                    🗑️ Löschen
                </button>
            </div>
        </div>
        <div class="team-member-stats">
            <div class="stat-item">
                <span>Home-Office-Quote:</span>
                <span>${userData.quota || 40}%</span>
            </div>
            <div class="stat-item">
                <span>Erstellt:</span>
                <span>${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}</span>
            </div>
        </div>
    `;
    
    // Add event listeners for action buttons
    card.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (button) {
            e.preventDefault();
            e.stopPropagation();
            const action = button.dataset.action;
            const userId = button.dataset.user;
            
            if (action === 'reset') {
                resetEmployeePassword(userId);
            } else if (action === 'delete') {
                deleteEmployee(userId);
            }
        }
    });
    
    return card;
}

async function loadEmployeeSelect() {
    const select = document.getElementById('employeeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Mitarbeiter wählen...</option>';
    
    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            
            for (const [userId, userData] of Object.entries(users)) {
                if (userData.role === 'employee') {
                    const option = document.createElement('option');
                    option.value = userId;
                    option.textContent = userData.name;
                    select.appendChild(option);
                }
            }
        }
    } catch (error) {
        console.error('Error loading employee select:', error);
    }
}

async function resetEmployeePassword(userId) {
    if (!confirm(`Möchten Sie das Passwort für ${userId} auf "password123" zurücksetzen?`)) {
        return;
    }
    
    showLoading();
    try {
        const { hash, salt } = await hashPassword('password123');
        const userRef = ref(database, `users/${userId}`);
        const userData = await (await get(userRef)).val();
        
        await set(userRef, {
            ...userData,
            passwordHash: hash,
            salt: salt,
            lastUpdated: new Date().toISOString()
        });
        
        showNotification(`Passwort für ${userId} zurückgesetzt!`);
    } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Fehler beim Zurücksetzen des Passworts!', 'error');
    }
    hideLoading();
}

async function deleteEmployee(userId) {
    if (!confirm(`Möchten Sie den Mitarbeiter ${userId} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!`)) {
        return;
    }
    
    showLoading();
    try {
        // Delete user data
        await remove(ref(database, `users/${userId}`));
        // Delete user plans
        await remove(ref(database, `plans/${userId}`));
        
        showNotification(`Mitarbeiter ${userId} gelöscht!`);
        loadTeamOverview();
    } catch (error) {
        console.error('Error deleting employee:', error);
        showNotification('Fehler beim Löschen des Mitarbeiters!', 'error');
    }
    hideLoading();
}

// Settings Functions
function openSettings() {
    console.log('openSettings called');
    showElement('settingsModal');
    if (currentUser) {
        const quotaSetting = document.getElementById('quotaSetting');
        if (quotaSetting) {
            quotaSetting.value = currentUser.quota;
        }
    }
}

function closeSettings() {
    console.log('closeSettings called');
    hideElement('settingsModal');
}

async function updateQuota() {
    const newQuota = parseInt(document.getElementById('quotaSetting').value);
    
    if (newQuota < 0 || newQuota > 100) {
        showNotification('Quote muss zwischen 0% und 100% liegen!', 'error');
        return;
    }
    
    showLoading();
    try {
        currentUser.quota = newQuota;
        
        if (currentUser.role === 'employee') {
            const userRef = ref(database, `users/${currentUser.id}`);
            const userData = await (await get(userRef)).val();
            await set(userRef, {
                ...userData,
                quota: newQuota,
                lastUpdated: new Date().toISOString()
            });
        }
        
        showNotification('Home-Office-Quote aktualisiert!');
        updateDashboardStats();
    } catch (error) {
        console.error('Error updating quota:', error);
        showNotification('Fehler beim Aktualisieren der Quote!', 'error');
    }
    hideLoading();
}

// Make functions globally available
window.showUserTypeSelection = showUserTypeSelection;
window.showLogin = showLogin;
window.logout = logout;
window.showStatusModal = showStatusModal;
window.closeStatusModal = closeStatusModal;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.updateQuota = updateQuota;

// Connection Status Monitor
function monitorConnection() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    function updateStatus(online) {
        connectionStatus = online;
        if (statusDot && statusText) {
            if (online) {
                statusDot.classList.remove('offline');
                statusText.textContent = 'Verbunden';
            } else {
                statusDot.classList.add('offline');
                statusText.textContent = 'Offline';
            }
        }
    }
    
    window.addEventListener('online', () => updateStatus(true));
    window.addEventListener('offline', () => updateStatus(false));
    updateStatus(navigator.onLine);
}

// Event Listeners Setup
function setupEventListeners() {
    // User type selection buttons - fixed click handling
    const mitarbeiterBtn = document.querySelector('button[onclick="showLogin(\'employee\')"]');
    const teamleiterBtn = document.querySelector('button[onclick="showLogin(\'teamleader\')"]');
    const registerBtn = document.querySelector('button[onclick="showLogin(\'register\')"]');
    
    if (mitarbeiterBtn) {
        mitarbeiterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showLogin('employee');
        });
    }
    
    if (teamleiterBtn) {
        teamleiterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showLogin('teamleader');
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showLogin('register');
        });
    }
    
    // Back buttons
    document.querySelectorAll('button[onclick="showUserTypeSelection()"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showUserTypeSelection();
        });
    });
    
    // Logout buttons
    document.querySelectorAll('button[onclick="logout()"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    });
    
    // Login forms
    const employeeLoginForm = document.getElementById('employeeLoginForm');
    if (employeeLoginForm) {
        employeeLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('employeeName').value;
            const password = document.getElementById('employeePassword').value;
            await authenticateEmployee(name, password);
        });
    }
    
    const teamleaderLoginForm = document.getElementById('teamleaderLoginForm');
    if (teamleaderLoginForm) {
        teamleaderLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('teamleaderPassword').value;
            await authenticateTeamleader(password);
        });
    }
    
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerPasswordConfirm').value;
            
            if (password !== confirmPassword) {
                showNotification('Passwörter stimmen nicht überein!', 'error');
                return;
            }
            
            await registerUser(name, password);
        });
    }
    
    // Calendar navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
            updateDashboardStats();
        });
    }
    
    const nextMonthBtn = document.getElementById('nextMonth');
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
            updateDashboardStats();
        });
    }
    
    // Status modal
    document.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const status = e.currentTarget.dataset.status;
            setStatus(status);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('button[onclick="closeStatusModal()"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeStatusModal();
        });
    });
    
    document.querySelectorAll('button[onclick="closeSettings()"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSettings();
        });
    });
    
    // Settings
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSettings();
        });
    }
    
    // Update quota button
    document.querySelectorAll('button[onclick="updateQuota()"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            updateQuota();
        });
    });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    setupEventListeners();
    monitorConnection();
    showUserTypeSelection();
    
    // Initialize default date to current month
    currentDate = new Date();
});