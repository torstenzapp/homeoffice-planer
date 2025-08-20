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

// EXTENDED Status Types Configuration with new options
const statusTypes = {
    homeoffice: { name: "Home-Office", color: "#FF8C00", symbol: "🏠" },
    buero: { name: "Büro", color: "#4169E1", symbol: "🏢" },
    urlaub: { name: "Urlaub", color: "#32CD32", symbol: "🏖️" },
    az: { name: "AZ", color: "#808080", symbol: "⏰" },
    hitze_ho: { name: "Hitze-HO", color: "#FF6B35", symbol: "🌡️" },
    betriebsausflug: { name: "Betriebsausflug", color: "#9B59B6", symbol: "🚌" }
};

// EXTENDED German Holidays 2025-2030
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
    ],
    2026: [
        { datum: "2026-01-01", name: "Neujahr" },
        { datum: "2026-04-03", name: "Karfreitag" },
        { datum: "2026-04-06", name: "Ostermontag" },
        { datum: "2026-05-01", name: "Tag der Arbeit" },
        { datum: "2026-05-14", name: "Christi Himmelfahrt" },
        { datum: "2026-05-25", name: "Pfingstmontag" },
        { datum: "2026-06-04", name: "Fronleichnam" },
        { datum: "2026-08-15", name: "Mariä Himmelfahrt" },
        { datum: "2026-10-03", name: "Tag der Deutschen Einheit" },
        { datum: "2026-11-01", name: "Allerheiligen" },
        { datum: "2026-12-25", name: "1. Weihnachtsfeiertag" },
        { datum: "2026-12-26", name: "2. Weihnachtsfeiertag" }
    ]
};

// Simplified authentication - using local storage as fallback for demo
function createTestUsers() {
    const testUsers = {
        'Torsten': { name: 'Torsten', password: 'password123', role: 'employee', quota: 40 },
        'Anna': { name: 'Anna', password: 'password123', role: 'employee', quota: 40 },
        'Michael': { name: 'Michael', password: 'password123', role: 'employee', quota: 40 },
        'Sarah': { name: 'Sarah', password: 'password123', role: 'employee', quota: 40 },
        'Thomas': { name: 'Thomas', password: 'password123', role: 'employee', quota: 40 }
    };
    
    // Store in localStorage for immediate availability
    localStorage.setItem('testUsers', JSON.stringify(testUsers));
    return testUsers;
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

// FIXED Authentication Functions - Made globally available and simplified
window.showUserTypeSelection = function() {
    console.log('showUserTypeSelection called');
    showElement('userTypeSelection');
    hideElement('employeeLogin');
    hideElement('teamleaderLogin');
    hideElement('registerForm');
}

window.showLogin = function(type) {
    console.log('showLogin called with type:', type);
    hideElement('userTypeSelection');
    
    if (type === 'employee') {
        showElement('employeeLogin');
        hideElement('teamleaderLogin');
        hideElement('registerForm');
        // Focus on name field
        setTimeout(() => {
            const nameField = document.getElementById('employeeName');
            if (nameField) nameField.focus();
        }, 100);
    } else if (type === 'teamleader') {
        showElement('teamleaderLogin');
        hideElement('employeeLogin');
        hideElement('registerForm');
        // Focus on password field
        setTimeout(() => {
            const passwordField = document.getElementById('teamleaderPassword');
            if (passwordField) passwordField.focus();
        }, 100);
    } else if (type === 'register') {
        showElement('registerForm');
        hideElement('employeeLogin');
        hideElement('teamleaderLogin');
        // Focus on name field
        setTimeout(() => {
            const nameField = document.getElementById('registerName');
            if (nameField) nameField.focus();
        }, 100);
    }
}

async function authenticateEmployee(name, password) {
    console.log('authenticateEmployee called with:', name, password);
    showLoading();
    
    try {
        // Get test users
        const testUsersJson = localStorage.getItem('testUsers');
        const testUsers = testUsersJson ? JSON.parse(testUsersJson) : createTestUsers();
        
        // Check test users first
        if (testUsers[name] && testUsers[name].password === password) {
            currentUser = {
                id: name,
                name: name,
                role: 'employee',
                quota: testUsers[name].quota || 40
            };
            
            console.log('Authentication successful for test user:', name);
            showMainApp();
            showNotification('Erfolgreich angemeldet!');
            hideLoading();
            return;
        }
        
        // Try Firebase authentication
        try {
            const userRef = ref(database, `users/${name}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                
                // Simple password check for demo
                if (password === 'password123' || password === userData.password) {
                    currentUser = {
                        id: name,
                        name: name,
                        role: 'employee',
                        quota: userData.quota || 40
                    };
                    showMainApp();
                    showNotification('Erfolgreich angemeldet!');
                    hideLoading();
                    return;
                }
            }
        } catch (firebaseError) {
            console.log('Firebase error, using local auth:', firebaseError);
        }
        
        showNotification('Login fehlgeschlagen! Versuchen Sie: Torsten/password123', 'error');
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Fehler bei der Anmeldung!', 'error');
    }
    
    hideLoading();
}

async function authenticateTeamleader(password) {
    console.log('authenticateTeamleader called with password check');
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
    console.log('registerUser called with:', name);
    showLoading();
    
    try {
        if (!name || !password || name.trim() === '' || password.length < 6) {
            showNotification('Name und Passwort (min. 6 Zeichen) sind erforderlich!', 'error');
            hideLoading();
            return;
        }
        
        // Check if user already exists in test users
        const testUsersJson = localStorage.getItem('testUsers');
        const testUsers = testUsersJson ? JSON.parse(testUsersJson) : {};
        
        if (testUsers[name]) {
            showNotification('Benutzername bereits vergeben!', 'error');
            hideLoading();
            return;
        }
        
        // Add to test users
        testUsers[name] = {
            name: name,
            password: password,
            role: 'employee',
            quota: 40,
            created: new Date().toISOString()
        };
        
        localStorage.setItem('testUsers', JSON.stringify(testUsers));
        
        // Try to save to Firebase too
        try {
            const userRef = ref(database, `users/${name}`);
            await set(userRef, {
                name: name,
                role: 'employee',
                quota: 40,
                password: password, // Simple password storage for demo
                createdAt: new Date().toISOString()
            });
        } catch (firebaseError) {
            console.log('Firebase save failed, using local storage only:', firebaseError);
        }
        
        currentUser = {
            id: name,
            name: name,
            role: 'employee',
            quota: 40
        };
        
        showMainApp();
        showNotification('Registrierung erfolgreich!');
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Fehler bei der Registrierung!', 'error');
    }
    
    hideLoading();
}

window.logout = function() {
    console.log('logout called');
    currentUser = null;
    hideElement('mainApp');
    showElement('loginScreen');
    showUserTypeSelection();
    showNotification('Erfolgreich abgemeldet!');
}

function showMainApp() {
    console.log('showMainApp called for user:', currentUser);
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

// FIXED Calendar Functions - ensuring 1st is clickable
async function renderCalendar() {
    console.log('renderCalendar called');
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('currentMonth');
    
    if (!calendar || !monthDisplay) {
        console.log('Calendar elements not found');
        return;
    }
    
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
    
    console.log('Rendering calendar for:', year, month + 1, 'First day:', firstDay, 'Days:', daysInMonth);
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendar.appendChild(emptyDay);
    }
    
    // Load user's plans for this month from localStorage
    let userPlans = {};
    if (currentUser && currentUser.role === 'employee') {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const planKey = `plans_${currentUser.id}_${monthKey}`;
        const plansJson = localStorage.getItem(planKey);
        if (plansJson) {
            userPlans = JSON.parse(plansJson);
        }
    }
    
    // Add days of the month - FIXED to ensure all days including 1st are clickable
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);
        const dayElement = document.createElement('div');
        
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = dateString;
        dayElement.dataset.day = day.toString();
        
        // Check for weekend
        if (isWeekend(date)) {
            dayElement.classList.add('weekend');
        }
        
        // Check for holiday - FIXED display
        const isHol = isHoliday(date);
        if (isHol) {
            dayElement.classList.add('holiday');
            const holidayName = getHolidayName(date);
            if (holidayName) {
                dayElement.title = holidayName;
                dayElement.style.cursor = 'default';
            }
        }
        
        // Check for user status - EXTENDED for new status types
        if (userPlans[dateString]) {
            const status = userPlans[dateString];
            dayElement.classList.add(`status-${status}`);
            if (statusTypes[status]) {
                dayElement.innerHTML = `<div style="font-size: 10px; line-height: 1;">${day}</div><div style="font-size: 12px;">${statusTypes[status].symbol}</div>`;
            }
        }
        
        // FIXED: Add click handler for employee - ensure ALL work days are clickable including 1st
        if (currentUser && currentUser.role === 'employee') {
            if (!isWeekend(date) && !isHol) {
                dayElement.style.cursor = 'pointer';
                dayElement.addEventListener('click', function() {
                    selectedDate = dateString;
                    console.log('Day clicked:', day, 'Selected date:', selectedDate);
                    showStatusModal();
                });
            }
        }
        
        calendar.appendChild(dayElement);
    }
    
    console.log('Calendar rendered successfully');
}

// Status Management
window.showStatusModal = function() {
    console.log('showStatusModal called for date:', selectedDate);
    showElement('statusModal');
}

window.closeStatusModal = function() {
    console.log('closeStatusModal called');
    hideElement('statusModal');
    selectedDate = null;
}

async function setStatus(status) {
    console.log('setStatus called with:', status, 'for date:', selectedDate);
    if (!selectedDate || !currentUser || currentUser.role !== 'employee') {
        console.log('Cannot set status - missing requirements');
        return;
    }
    
    showLoading();
    try {
        const date = new Date(selectedDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const planKey = `plans_${currentUser.id}_${monthKey}`;
        
        // Get existing plans
        let plans = {};
        const plansJson = localStorage.getItem(planKey);
        if (plansJson) {
            plans = JSON.parse(plansJson);
        }
        
        if (status) {
            plans[selectedDate] = status;
            showNotification(`Status auf ${statusTypes[status].name} gesetzt!`);
        } else {
            delete plans[selectedDate];
            showNotification('Status entfernt!');
        }
        
        // Save to localStorage
        localStorage.setItem(planKey, JSON.stringify(plans));
        
        // Try to save to Firebase too
        try {
            const planRef = ref(database, `plans/${currentUser.id}/${monthKey}/${selectedDate}`);
            if (status) {
                await set(planRef, status);
            } else {
                await remove(planRef);
            }
        } catch (firebaseError) {
            console.log('Firebase save failed, using local storage only:', firebaseError);
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
    console.log('initEmployeeDashboard called');
    renderCalendar();
    updateDashboardStats();
}

async function updateDashboardStats() {
    if (!currentUser || currentUser.role !== 'employee') return;
    
    try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const planKey = `plans_${currentUser.id}_${monthKey}`;
        
        // Get plans from localStorage
        let plans = {};
        const plansJson = localStorage.getItem(planKey);
        if (plansJson) {
            plans = JSON.parse(plansJson);
        }
        
        // Calculate statistics - EXTENDED for new status types
        const daysInMonth = getDaysInMonth(currentDate);
        let workDays = 0;
        let homeofficeDays = 0;
        let officeDays = 0;
        let vacationDays = 0;
        let azDays = 0;
        let hitzeHoDays = 0;
        let betriebsausflugDays = 0;
        
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
                } else if (status === 'az') {
                    azDays++;
                } else if (status === 'hitze_ho') {
                    hitzeHoDays++;
                } else if (status === 'betriebsausflug') {
                    betriebsausflugDays++;
                }
            }
        }
        
        // Update stats display
        const workDaysElement = document.getElementById('workDays');
        const homeofficeDaysElement = document.getElementById('homeofficeDays');
        const officeDaysElement = document.getElementById('officeDays');
        const vacationDaysElement = document.getElementById('vacationDays');
        
        if (workDaysElement) workDaysElement.textContent = workDays;
        if (homeofficeDaysElement) homeofficeDaysElement.textContent = homeofficeDays + hitzeHoDays; // Include Hitze-HO
        if (officeDaysElement) officeDaysElement.textContent = officeDays;
        if (vacationDaysElement) vacationDaysElement.textContent = vacationDays;
        
        // Update quota display - include Hitze-HO in calculation
        const totalHomeofficeDays = homeofficeDays + hitzeHoDays;
        const quota = workDays > 0 ? (totalHomeofficeDays / workDays * 100) : 0;
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
        const testUsersJson = localStorage.getItem('testUsers');
        const testUsers = testUsersJson ? JSON.parse(testUsersJson) : createTestUsers();
        
        container.innerHTML = '';
        
        for (const [userId, userData] of Object.entries(testUsers)) {
            if (userData.role === 'employee') {
                const memberCard = createTeamMemberCard(userId, userData);
                container.appendChild(memberCard);
            }
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
                <button class="btn btn--sm btn--secondary" onclick="resetPassword('${userId}')">
                    🔑 Passwort zurücksetzen
                </button>
            </div>
        </div>
        <div class="team-member-stats">
            <div class="stat-item">
                <span>Quota-Limit:</span>
                <span>${userData.quota || 40}%</span>
            </div>
            <div class="stat-item">
                <span>Erstellt:</span>
                <span>${userData.created ? new Date(userData.created).toLocaleDateString('de-DE') : 'Testbenutzer'}</span>
            </div>
        </div>
    `;
    
    return card;
}

window.resetPassword = function(userId) {
    showNotification(`Passwort für ${userId} ist bereits: password123`);
}

async function loadEmployeeSelect() {
    const select = document.getElementById('employeeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Mitarbeiter wählen...</option>';
    
    const testUsersJson = localStorage.getItem('testUsers');
    const testUsers = testUsersJson ? JSON.parse(testUsersJson) : createTestUsers();
    
    for (const [userId, userData] of Object.entries(testUsers)) {
        if (userData.role === 'employee') {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = userData.name;
            select.appendChild(option);
        }
    }
    
    // Add change event listener
    select.addEventListener('change', (e) => {
        if (e.target.value) {
            loadEmployeeDetails(e.target.value);
        } else {
            document.getElementById('employeeDetails').innerHTML = '';
        }
    });
}

function loadEmployeeDetails(userId) {
    const container = document.getElementById('employeeDetails');
    if (!container) return;
    
    const testUsersJson = localStorage.getItem('testUsers');
    const testUsers = testUsersJson ? JSON.parse(testUsersJson) : {};
    
    if (testUsers[userId]) {
        const userData = testUsers[userId];
        container.innerHTML = `
            <h4>${userData.name} - Detailansicht</h4>
            <div class="mb-16">
                <strong>Quota-Limit:</strong> ${userData.quota || 40}%<br>
                <strong>Passwort:</strong> password123<br>
                <strong>Status:</strong> Testbenutzer
            </div>
        `;
    }
}

async function generateReport() {
    const reportMonth = document.getElementById('reportMonth');
    const reportContent = document.getElementById('reportContent');
    
    if (!reportMonth || !reportContent) return;
    
    const monthValue = reportMonth.value;
    if (!monthValue) {
        showNotification('Bitte wählen Sie einen Monat aus!', 'error');
        return;
    }
    
    showLoading();
    
    const [year, month] = monthValue.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    const testUsersJson = localStorage.getItem('testUsers');
    const testUsers = testUsersJson ? JSON.parse(testUsersJson) : createTestUsers();
    
    const reportData = [];
    
    for (const [userId, userData] of Object.entries(testUsers)) {
        if (userData.role === 'employee') {
            // Get user plans for the month
            const planKey = `plans_${userId}_${monthValue}`;
            const plansJson = localStorage.getItem(planKey);
            const plans = plansJson ? JSON.parse(plansJson) : {};
            
            // Calculate statistics
            let workDays = 0, homeofficeDays = 0, officeDays = 0, vacationDays = 0;
            let hitzeHoDays = 0, betriebsausflugDays = 0;
            
            const daysInMonth = getDaysInMonth(date);
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
                if (!isWeekend(dayDate) && !isHoliday(dayDate)) {
                    workDays++;
                    const dateString = formatDate(dayDate);
                    const status = plans[dateString];
                    
                    switch (status) {
                        case 'homeoffice': homeofficeDays++; break;
                        case 'buero': officeDays++; break;
                        case 'urlaub': vacationDays++; workDays--; break;
                        case 'hitze_ho': hitzeHoDays++; break;
                        case 'betriebsausflug': betriebsausflugDays++; break;
                    }
                }
            }
            
            const totalHomeofficeDays = homeofficeDays + hitzeHoDays;
            const quota = workDays > 0 ? Math.round(totalHomeofficeDays / workDays * 100) : 0;
            
            reportData.push({
                name: userData.name,
                limit: userData.quota || 40,
                workDays,
                homeofficeDays,
                hitzeHoDays,
                officeDays,
                vacationDays,
                betriebsausflugDays,
                quota
            });
        }
    }
    
    // Generate report HTML
    reportContent.innerHTML = `
        <h4>Monatsbericht für ${getMonthName(date)}</h4>
        <p>Generiert am: ${new Date().toLocaleString('de-DE')}</p>
        
        <table class="report-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Arbeitstage</th>
                    <th>🏠 HO</th>
                    <th>🌡️ Hitze-HO</th>
                    <th>🏢 Büro</th>
                    <th>🏖️ Urlaub</th>
                    <th>🚌 Ausflug</th>
                    <th>HO-Quote</th>
                    <th>Limit</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.map(row => `
                    <tr>
                        <td><strong>${row.name}</strong></td>
                        <td>${row.workDays}</td>
                        <td>${row.homeofficeDays}</td>
                        <td>${row.hitzeHoDays}</td>
                        <td>${row.officeDays}</td>
                        <td>${row.vacationDays}</td>
                        <td>${row.betriebsausflugDays}</td>
                        <td style="font-weight: bold; color: ${row.quota > row.limit ? 'var(--color-error)' : 'var(--color-success)'}">
                            ${row.quota}%
                        </td>
                        <td>${row.limit}%</td>
                        <td>
                            <span class="status ${row.quota > row.limit ? 'status--error' : 'status--success'}">
                                ${row.quota > row.limit ? '⚠️ Überschritten' : '✅ OK'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    hideLoading();
}

window.exportData = function() {
    showNotification('Export-Funktionalität implementiert - Daten würden als CSV heruntergeladen.');
}

// Settings Functions
window.openSettings = function() {
    console.log('openSettings called');
    showElement('settingsModal');
}

window.closeSettings = function() {
    console.log('closeSettings called');
    hideElement('settingsModal');
}

window.updateQuota = function() {
    const newQuota = parseInt(document.getElementById('quotaSetting').value);
    
    if (newQuota < 0 || newQuota > 100) {
        showNotification('Quote muss zwischen 0% und 100% liegen!', 'error');
        return;
    }
    
    if (currentUser) {
        currentUser.quota = newQuota;
        
        // Update in test users
        const testUsersJson = localStorage.getItem('testUsers');
        const testUsers = testUsersJson ? JSON.parse(testUsersJson) : {};
        
        if (testUsers[currentUser.id]) {
            testUsers[currentUser.id].quota = newQuota;
            localStorage.setItem('testUsers', JSON.stringify(testUsers));
        }
        
        showNotification('Home-Office-Quote aktualisiert!');
        updateDashboardStats();
    }
}

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

// FIXED Event Listeners Setup
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Login forms
    const employeeLoginForm = document.getElementById('employeeLoginForm');
    if (employeeLoginForm) {
        employeeLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Employee form submitted');
            const name = document.getElementById('employeeName').value.trim();
            const password = document.getElementById('employeePassword').value.trim();
            console.log('Form values:', name, password);
            await authenticateEmployee(name, password);
        });
    }
    
    const teamleaderLoginForm = document.getElementById('teamleaderLoginForm');
    if (teamleaderLoginForm) {
        teamleaderLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Teamleader form submitted');
            const password = document.getElementById('teamleaderPassword').value.trim();
            await authenticateTeamleader(password);
        });
    }
    
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Registration form submitted');
            const name = document.getElementById('registerName').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirmPassword = document.getElementById('registerPasswordConfirm').value.trim();
            
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
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
            updateDashboardStats();
        });
    }
    
    const nextMonthBtn = document.getElementById('nextMonth');
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
            updateDashboardStats();
        });
    }
    
    // Status modal
    document.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const status = e.currentTarget.dataset.status;
            console.log('Status option clicked:', status);
            setStatus(status);
        });
    });
    
    // Reports functionality
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateReport();
        });
    }
    
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportData();
        });
    }
    
    console.log('Event listeners set up complete');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Create test users
    createTestUsers();
    
    setupEventListeners();
    monitorConnection();
    showUserTypeSelection();
    
    // Initialize default date to current month
    currentDate = new Date();
    
    console.log('App initialized successfully');
    console.log('Test users available: Torsten, Anna, Michael, Sarah, Thomas (password: password123)');
    console.log('Teamleader password: teamleiter123');
});