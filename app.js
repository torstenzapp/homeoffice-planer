// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
  authDomain: "homeoffice-planer-drv.firebaseapp.com",
  databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "homeoffice-planer-drv",
  storageBucket: "homeoffice-planer-drv.firebasestorage.app",
  messagingSenderId: "669565818222",
  appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
};

// Global Variables
let app, database;
let currentUser = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateForStatus = null;
let isOnline = true;
let localData = {};
let isFirebaseInitialized = false;

// German holidays for 2025-2030
const holidays = {
  2025: [
    {datum: "2025-01-01", name: "Neujahr"},
    {datum: "2025-04-18", name: "Karfreitag"},
    {datum: "2025-04-21", name: "Ostermontag"},
    {datum: "2025-05-01", name: "Tag der Arbeit"},
    {datum: "2025-05-29", name: "Christi Himmelfahrt"},
    {datum: "2025-06-09", name: "Pfingstmontag"},
    {datum: "2025-06-19", name: "Fronleichnam"},
    {datum: "2025-08-15", name: "Mariä Himmelfahrt"},
    {datum: "2025-10-03", name: "Tag der Deutschen Einheit"},
    {datum: "2025-11-01", name: "Allerheiligen"},
    {datum: "2025-12-25", name: "1. Weihnachtsfeiertag"},
    {datum: "2025-12-26", name: "2. Weihnachtsfeiertag"}
  ],
  2026: [
    {datum: "2026-01-01", name: "Neujahr"},
    {datum: "2026-04-03", name: "Karfreitag"},
    {datum: "2026-04-06", name: "Ostermontag"},
    {datum: "2026-05-01", name: "Tag der Arbeit"},
    {datum: "2026-05-14", name: "Christi Himmelfahrt"},
    {datum: "2026-05-25", name: "Pfingstmontag"},
    {datum: "2026-06-04", name: "Fronleichnam"},
    {datum: "2026-08-15", name: "Mariä Himmelfahrt"},
    {datum: "2026-10-03", name: "Tag der Deutschen Einheit"},
    {datum: "2026-11-01", name: "Allerheiligen"},
    {datum: "2026-12-25", name: "1. Weihnachtsfeiertag"},
    {datum: "2026-12-26", name: "2. Weihnachtsfeiertag"}
  ]
};

// Status types
const statusTypes = {
  homeoffice: {name: "Home-Office", color: "#FF8C00", symbol: "🏠"},
  buero: {name: "Büro", color: "#4169E1", symbol: "🏢"},
  urlaub: {name: "Urlaub", color: "#32CD32", symbol: "🏖️"},
  az: {name: "AZ", color: "#808080", symbol: "⏰"}
};

// Default users
const defaultUsers = ["Torsten Zapp", "Anna", "Michael", "Sarah", "Thomas"];

// SHA-256 Hash function
async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error hashing password:', error);
    // Fallback to simple hash if crypto.subtle is not available
    return btoa(password).replace(/[^a-zA-Z0-9]/g, '');
  }
}

// Initialize Firebase with better error handling
function initializeFirebase() {
  try {
    console.log('Initializing Firebase...');
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    isFirebaseInitialized = true;
    
    // Monitor connection status
    database.ref('.info/connected').on('value', function(snapshot) {
      isOnline = snapshot.val();
      console.log('Firebase connection status:', isOnline);
      updateConnectionStatus();
    });
    
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    isFirebaseInitialized = false;
    isOnline = false;
    updateConnectionStatus();
    return false;
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded, initializing app...');
  
  // Small delay to ensure Firebase SDK is fully loaded
  setTimeout(() => {
    initializeApp();
    setupEventListeners();
  }, 100);
});

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Login buttons
  const employeeLoginBtn = document.getElementById('employeeLoginBtn');
  const teamLeaderLoginBtn = document.getElementById('teamLeaderLoginBtn');
  const newEmployeeBtn = document.getElementById('newEmployeeBtn');
  
  if (employeeLoginBtn) {
    employeeLoginBtn.addEventListener('click', showEmployeeLogin);
  }
  if (teamLeaderLoginBtn) {
    teamLeaderLoginBtn.addEventListener('click', showTeamLeaderLogin);
  }
  if (newEmployeeBtn) {
    newEmployeeBtn.addEventListener('click', showNewEmployeeForm);
  }
  
  // Login form submissions
  const employeeLoginSubmit = document.getElementById('employeeLoginSubmit');
  const teamLeaderLoginSubmit = document.getElementById('teamLeaderLoginSubmit');
  const newEmployeeSubmit = document.getElementById('newEmployeeSubmit');
  
  if (employeeLoginSubmit) {
    employeeLoginSubmit.addEventListener('click', loginEmployee);
  }
  if (teamLeaderLoginSubmit) {
    teamLeaderLoginSubmit.addEventListener('click', loginTeamLeader);
  }
  if (newEmployeeSubmit) {
    newEmployeeSubmit.addEventListener('click', registerNewEmployee);
  }
  
  // Main app buttons
  const logoutBtn = document.getElementById('logoutBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const teamLeaderNav = document.getElementById('teamLeaderNav');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showSettingsModal);
  }
  if (teamLeaderNav) {
    teamLeaderNav.addEventListener('click', showTeamOverview);
  }
  
  // Calendar navigation
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', previousMonth);
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', nextMonth);
  }
  
  // Settings buttons
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const updateQuotaBtn = document.getElementById('updateQuotaBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', changePassword);
  }
  if (updateQuotaBtn) {
    updateQuotaBtn.addEventListener('click', updateQuotaSettings);
  }
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', confirmAccountDeletion);
  }
  
  // Report buttons
  const generateReportBtn = document.getElementById('generateReportBtn');
  const exportDataBtn = document.getElementById('exportDataBtn');
  
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateReport);
  }
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportData);
  }
  
  // Modal close buttons
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      if (modalId) {
        closeModal(modalId);
      }
    });
  });
  
  // Status buttons
  const statusButtons = document.querySelectorAll('.status-button');
  statusButtons.forEach(button => {
    button.addEventListener('click', function() {
      const status = this.getAttribute('data-status');
      if (status === 'remove') {
        removeDayStatus();
      } else {
        setDayStatus(status);
      }
    });
  });
  
  // Tab buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      showTab(tabName, this);
    });
  });
  
  // Enter key handlers for password fields
  const employeePassword = document.getElementById('employeePassword');
  if (employeePassword) {
    employeePassword.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        loginEmployee();
      }
    });
  }
  
  const teamLeaderPassword = document.getElementById('teamLeaderPassword');
  if (teamLeaderPassword) {
    teamLeaderPassword.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        loginTeamLeader();
      }
    });
  }
  
  console.log('Event listeners setup completed');
}

async function initializeApp() {
  showLoading(true);
  
  try {
    // Initialize Firebase first
    const firebaseReady = initializeFirebase();
    
    if (firebaseReady) {
      console.log('Firebase initialized successfully');
      // Initialize default users
      await initializeDefaultUsers();
    } else {
      console.warn('Firebase initialization failed, running in offline mode');
    }
    
  } catch (error) {
    console.error('App initialization error:', error);
  } finally {
    showLoading(false);
  }
}

async function initializeDefaultUsers() {
  if (!isFirebaseInitialized) {
    console.log('Firebase not initialized, skipping user initialization');
    return;
  }
  
  try {
    console.log('Initializing default users...');
    const defaultPasswordHash = await hashPassword('password123');
    const teamLeaderPasswordHash = await hashPassword('teamleiter123');
    
    console.log('Default password hash:', defaultPasswordHash.substring(0, 10) + '...');
    
    // Check if users exist, if not create them
    for (const userName of defaultUsers) {
      const userRef = database.ref(`users/${userName.toLowerCase()}`);
      
      try {
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
          console.log(`Creating user: ${userName}`);
          await userRef.set({
            profile: {
              name: userName,
              role: 'employee',
              quota: 40,
              passwordHash: defaultPasswordHash,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          });
          console.log(`User ${userName} created successfully`);
        } else {
          console.log(`User ${userName} already exists`);
        }
      } catch (error) {
        console.error(`Error creating user ${userName}:`, error);
      }
    }
    
    // Initialize team leader account
    const teamLeaderRef = database.ref('users/teamleiter');
    try {
      const teamLeaderSnapshot = await teamLeaderRef.once('value');
      
      if (!teamLeaderSnapshot.exists()) {
        console.log('Creating teamleiter account...');
        await teamLeaderRef.set({
          profile: {
            name: 'Teamleiter',
            role: 'teamleader',
            quota: 100,
            passwordHash: teamLeaderPasswordHash,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
          }
        });
        console.log('Teamleiter account created successfully');
      } else {
        console.log('Teamleiter account already exists');
      }
    } catch (error) {
      console.error('Error creating teamleiter account:', error);
    }
    
    console.log('Default users initialization completed');
    
  } catch (error) {
    console.error('Error initializing default users:', error);
  }
}

// Login Functions
function showEmployeeLogin() {
  console.log('Showing employee login modal');
  document.getElementById('employeeLoginModal').classList.remove('hidden');
  // Clear previous error messages
  const errorElement = document.getElementById('employeeLoginError');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

function showTeamLeaderLogin() {
  console.log('Showing team leader login modal');
  document.getElementById('teamLeaderLoginModal').classList.remove('hidden');
  // Clear previous error messages
  const errorElement = document.getElementById('teamLeaderLoginError');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

function showNewEmployeeForm() {
  console.log('Showing new employee form modal');
  document.getElementById('newEmployeeModal').classList.remove('hidden');
  // Clear previous error messages
  const errorElement = document.getElementById('newEmployeeError');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

async function loginEmployee() {
  console.log('Employee login attempt started...');
  
  const name = document.getElementById('employeeName').value;
  const password = document.getElementById('employeePassword').value;
  const errorElement = document.getElementById('employeeLoginError');
  
  console.log('Login attempt for user:', name);
  
  if (!name || !password) {
    showError(errorElement, 'Bitte wählen Sie einen Namen und geben Sie das Passwort ein.');
    return;
  }
  
  if (!isFirebaseInitialized) {
    showError(errorElement, 'Verbindung zur Datenbank fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    return;
  }
  
  try {
    showLoading(true);
    console.log('Hashing password...');
    const passwordHash = await hashPassword(password);
    console.log('Password hash generated:', passwordHash.substring(0, 10) + '...');
    
    const userRef = database.ref(`users/${name.toLowerCase()}`);
    console.log('Fetching user data from:', `users/${name.toLowerCase()}`);
    
    const snapshot = await userRef.once('value');
    console.log('User snapshot exists:', snapshot.exists());
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('User data retrieved:', userData);
      
      if (userData.profile && userData.profile.passwordHash) {
        console.log('Stored hash:', userData.profile.passwordHash.substring(0, 10) + '...');
        console.log('Input hash:', passwordHash.substring(0, 10) + '...');
        
        if (userData.profile.passwordHash === passwordHash) {
          console.log('Password match successful!');
          
          currentUser = {
            id: name.toLowerCase(),
            name: userData.profile.name,
            role: userData.profile.role,
            quota: userData.profile.quota
          };
          
          console.log('User logged in:', currentUser);
          
          closeModal('employeeLoginModal');
          showMainApp();
        } else {
          console.log('Password mismatch');
          showError(errorElement, 'Falsches Passwort.');
        }
      } else {
        console.log('User profile data incomplete');
        showError(errorElement, 'Benutzerdaten sind unvollständig.');
      }
    } else {
      console.log('User not found in database');
      showError(errorElement, 'Benutzer nicht gefunden.');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(errorElement, 'Anmeldefehler: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function loginTeamLeader() {
  console.log('Team leader login attempt started...');
  
  const password = document.getElementById('teamLeaderPassword').value;
  const errorElement = document.getElementById('teamLeaderLoginError');
  
  if (!password) {
    showError(errorElement, 'Bitte geben Sie das Teamleiter-Passwort ein.');
    return;
  }
  
  if (!isFirebaseInitialized) {
    showError(errorElement, 'Verbindung zur Datenbank fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    return;
  }
  
  try {
    showLoading(true);
    const passwordHash = await hashPassword(password);
    const userRef = database.ref('users/teamleiter');
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.profile && userData.profile.passwordHash === passwordHash) {
        currentUser = {
          id: 'teamleiter',
          name: 'Teamleiter',
          role: 'teamleader',
          quota: 100
        };
        
        closeModal('teamLeaderLoginModal');
        showMainApp();
      } else {
        showError(errorElement, 'Falsches Teamleiter-Passwort.');
      }
    } else {
      showError(errorElement, 'Teamleiter-Account nicht gefunden.');
    }
  } catch (error) {
    console.error('Team leader login error:', error);
    showError(errorElement, 'Anmeldefehler: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function registerNewEmployee() {
  const name = document.getElementById('newEmployeeName').value.trim();
  const password = document.getElementById('newEmployeePassword').value;
  const confirmPassword = document.getElementById('newEmployeePasswordConfirm').value;
  const errorElement = document.getElementById('newEmployeeError');
  
  if (!name || !password || !confirmPassword) {
    showError(errorElement, 'Bitte füllen Sie alle Felder aus.');
    return;
  }
  
  if (password !== confirmPassword) {
    showError(errorElement, 'Passwörter stimmen nicht überein.');
    return;
  }
  
  if (password.length < 6) {
    showError(errorElement, 'Passwort muss mindestens 6 Zeichen lang sein.');
    return;
  }
  
  if (!isFirebaseInitialized) {
    showError(errorElement, 'Verbindung zur Datenbank fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    return;
  }
  
  try {
    showLoading(true);
    const userId = name.toLowerCase().replace(/\s+/g, '_');
    const userRef = database.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      showError(errorElement, 'Ein Benutzer mit diesem Namen existiert bereits.');
      return;
    }
    
    const passwordHash = await hashPassword(password);
    
    await userRef.set({
      profile: {
        name: name,
        role: 'employee',
        quota: 40,
        passwordHash: passwordHash,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
      }
    });
    
    currentUser = {
      id: userId,
      name: name,
      role: 'employee',
      quota: 40
    };
    
    closeModal('newEmployeeModal');
    showMainApp();
    
  } catch (error) {
    console.error('Registration error:', error);
    showError(errorElement, 'Registrierungsfehler: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Main App Functions
function showMainApp() {
  console.log('Showing main app for user:', currentUser);
  
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Update welcome message
  document.getElementById('userWelcome').textContent = `Willkommen, ${currentUser.name}`;
  
  // Show team leader navigation if applicable
  if (currentUser.role === 'teamleader') {
    document.getElementById('teamLeaderNav').classList.remove('hidden');
    document.getElementById('teamLeaderNavigation').classList.remove('hidden');
    document.getElementById('teamLeaderSettings').classList.remove('hidden');
  }
  
  // Initialize calendar
  updateCalendar();
  loadUserData();
}

function logout() {
  console.log('Logging out user:', currentUser);
  
  currentUser = null;
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  
  // Hide team leader elements
  document.getElementById('teamLeaderNav').classList.add('hidden');
  document.getElementById('teamLeaderNavigation').classList.add('hidden');
  document.getElementById('teamOverviewPanel').classList.add('hidden');
  
  // Clear forms
  document.getElementById('employeeName').value = '';
  document.getElementById('employeePassword').value = '';
  document.getElementById('teamLeaderPassword').value = '';
  document.getElementById('newEmployeeName').value = '';
  document.getElementById('newEmployeePassword').value = '';
  document.getElementById('newEmployeePasswordConfirm').value = '';
  
  // Clear error messages
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.classList.add('hidden');
    element.textContent = '';
  });
}

// Calendar Functions
function updateCalendar() {
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  generateCalendarDays();
}

function generateCalendarDays() {
  const calendarGrid = document.querySelector('.calendar-grid');
  const dayHeaders = calendarGrid.querySelectorAll('.calendar-day-header');
  
  // Remove existing day elements but keep headers
  const existingDays = calendarGrid.querySelectorAll('.calendar-day');
  existingDays.forEach(day => day.remove());
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start
  const daysInMonth = lastDay.getDate();
  
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDate = new Date(currentYear, currentMonth, -firstDayOfWeek + i + 1);
    const dayElement = createDayElement(prevDate, true);
    calendarGrid.appendChild(dayElement);
  }
  
  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayElement = createDayElement(date, false);
    calendarGrid.appendChild(dayElement);
  }
  
  // Add empty cells to complete the grid
  const totalCells = calendarGrid.children.length - 7; // Exclude headers
  const remainingCells = 42 - totalCells; // 6 rows × 7 days
  
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(currentYear, currentMonth + 1, i);
    const dayElement = createDayElement(nextDate, true);
    calendarGrid.appendChild(dayElement);
  }
}

function createDayElement(date, isOtherMonth) {
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';
  
  const dateString = date.toISOString().split('T')[0];
  const dayNumber = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isToday = dateString === new Date().toISOString().split('T')[0];
  const isHoliday = isGermanHoliday(dateString);
  
  // Add classes
  if (isOtherMonth) {
    dayElement.classList.add('other-month');
  }
  if (isWeekend) {
    dayElement.classList.add('weekend');
  }
  if (isToday) {
    dayElement.classList.add('today');
  }
  if (isHoliday) {
    dayElement.classList.add('holiday');
  }
  
  // Day number
  const dayNumberElement = document.createElement('div');
  dayNumberElement.className = 'day-number';
  dayNumberElement.textContent = dayNumber;
  dayElement.appendChild(dayNumberElement);
  
  // Holiday name
  if (isHoliday) {
    const holidayElement = document.createElement('div');
    holidayElement.className = 'day-holiday';
    holidayElement.textContent = getHolidayName(dateString);
    dayElement.appendChild(holidayElement);
  }
  
  // Status display
  const statusElement = document.createElement('div');
  statusElement.className = 'day-status';
  dayElement.appendChild(statusElement);
  
  // Add click handler for weekdays only
  if (!isWeekend && !isHoliday && !isOtherMonth) {
    dayElement.addEventListener('click', () => openStatusModal(dateString));
    dayElement.style.cursor = 'pointer';
  } else {
    dayElement.style.cursor = 'default';
  }
  
  return dayElement;
}

function isGermanHoliday(dateString) {
  const year = parseInt(dateString.split('-')[0]);
  const yearHolidays = holidays[year] || [];
  return yearHolidays.some(holiday => holiday.datum === dateString);
}

function getHolidayName(dateString) {
  const year = parseInt(dateString.split('-')[0]);
  const yearHolidays = holidays[year] || [];
  const holiday = yearHolidays.find(holiday => holiday.datum === dateString);
  return holiday ? holiday.name : '';
}

function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateCalendar();
  loadUserData();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendar();
  loadUserData();
}

// Status Management
function openStatusModal(dateString) {
  selectedDateForStatus = dateString;
  document.getElementById('selectedDate').textContent = formatDate(dateString);
  document.getElementById('statusModal').classList.remove('hidden');
}

async function setDayStatus(status) {
  if (!selectedDateForStatus || !currentUser) return;
  
  try {
    const [year, month] = selectedDateForStatus.split('-');
    const monthKey = `${year}-${month}`;
    const dayKey = selectedDateForStatus;
    
    if (isOnline && isFirebaseInitialized) {
      await database.ref(`plans/${currentUser.id}/${monthKey}/${dayKey}`).set(status);
    } else {
      // Store locally for offline mode
      if (!localData[currentUser.id]) localData[currentUser.id] = {};
      if (!localData[currentUser.id][monthKey]) localData[currentUser.id][monthKey] = {};
      localData[currentUser.id][monthKey][dayKey] = status;
    }
    
    closeModal('statusModal');
    updateCalendarDay(selectedDateForStatus, status);
    
    if (currentUser.role === 'teamleader') {
      updateTeamOverview();
    }
    
  } catch (error) {
    console.error('Error setting day status:', error);
    alert('Fehler beim Speichern des Status. Bitte versuchen Sie es erneut.');
  }
}

async function removeDayStatus() {
  if (!selectedDateForStatus || !currentUser) return;
  
  try {
    const [year, month] = selectedDateForStatus.split('-');
    const monthKey = `${year}-${month}`;
    const dayKey = selectedDateForStatus;
    
    if (isOnline && isFirebaseInitialized) {
      await database.ref(`plans/${currentUser.id}/${monthKey}/${dayKey}`).remove();
    } else {
      // Remove locally for offline mode
      if (localData[currentUser.id] && localData[currentUser.id][monthKey]) {
        delete localData[currentUser.id][monthKey][dayKey];
      }
    }
    
    closeModal('statusModal');
    updateCalendarDay(selectedDateForStatus, null);
    
    if (currentUser.role === 'teamleader') {
      updateTeamOverview();
    }
    
  } catch (error) {
    console.error('Error removing day status:', error);
    alert('Fehler beim Entfernen des Status. Bitte versuchen Sie es erneut.');
  }
}

function updateCalendarDay(dateString, status) {
  const dayElements = document.querySelectorAll('.calendar-day');
  
  dayElements.forEach(dayElement => {
    const dayNumber = parseInt(dayElement.querySelector('.day-number').textContent);
    const elementDate = new Date(currentYear, currentMonth, dayNumber);
    const elementDateString = elementDate.toISOString().split('T')[0];
    
    if (elementDateString === dateString) {
      const statusElement = dayElement.querySelector('.day-status');
      statusElement.className = 'day-status';
      statusElement.textContent = '';
      
      if (status && statusTypes[status]) {
        statusElement.classList.add(status);
        statusElement.textContent = statusTypes[status].symbol;
      }
    }
  });
}

async function loadUserData() {
  if (!currentUser) return;
  
  try {
    const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    let monthData = {};
    
    if (isOnline && isFirebaseInitialized) {
      const snapshot = await database.ref(`plans/${currentUser.id}/${monthKey}`).once('value');
      monthData = snapshot.val() || {};
    } else {
      // Load from local data
      if (localData[currentUser.id] && localData[currentUser.id][monthKey]) {
        monthData = localData[currentUser.id][monthKey];
      }
    }
    
    // Update calendar with loaded data
    Object.keys(monthData).forEach(dateString => {
      updateCalendarDay(dateString, monthData[dateString]);
    });
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Team Leader Functions
function showTeamOverview() {
  document.getElementById('calendarView').classList.add('hidden');
  document.getElementById('teamOverviewPanel').classList.remove('hidden');
  updateTeamOverview();
}

function showTab(tabName, buttonElement) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(`${tabName}Tab`).classList.add('active');
  
  // Activate button
  if (buttonElement) {
    buttonElement.classList.add('active');
  }
  
  if (tabName === 'overview') {
    updateTeamOverview();
  } else if (tabName === 'details') {
    loadEmployeeDetails();
  } else if (tabName === 'reports') {
    initializeReports();
  }
}

async function updateTeamOverview() {
  if (!isOnline || !isFirebaseInitialized) {
    document.getElementById('teamStatistics').innerHTML = '<p>Team-Übersicht ist nur online verfügbar.</p>';
    return;
  }
  
  try {
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    const plansSnapshot = await database.ref('plans').once('value');
    const plans = plansSnapshot.val() || {};
    
    const today = new Date().toISOString().split('T')[0];
    const todayStatus = {};
    
    // Get today's status for all users
    Object.keys(users).forEach(userId => {
      if (users[userId].profile && users[userId].profile.role === 'employee') {
        const [year, month] = today.split('-');
        const monthKey = `${year}-${month}`;
        
        if (plans[userId] && plans[userId][monthKey] && plans[userId][monthKey][today]) {
          todayStatus[userId] = plans[userId][monthKey][today];
        } else {
          todayStatus[userId] = 'buero'; // Default to office
        }
      }
    });
    
    // Display team statistics
    displayTeamStatistics(users, plans);
    displayTodayTeamStatus(users, todayStatus);
    
  } catch (error) {
    console.error('Error updating team overview:', error);
  }
}

function displayTeamStatistics(users, plans) {
  const employees = Object.keys(users).filter(userId => 
    users[userId].profile && users[userId].profile.role === 'employee'
  );
  
  const totalEmployees = employees.length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  let totalHomeOfficeDays = 0;
  let totalWorkDays = 0;
  
  employees.forEach(userId => {
    if (plans[userId] && plans[userId][monthKey]) {
      const monthPlans = plans[userId][monthKey];
      Object.keys(monthPlans).forEach(date => {
        totalWorkDays++;
        if (monthPlans[date] === 'homeoffice') {
          totalHomeOfficeDays++;
        }
      });
    }
  });
  
  const homeOfficePercentage = totalWorkDays > 0 ? 
    Math.round((totalHomeOfficeDays / totalWorkDays) * 100) : 0;
  
  const statisticsHTML = `
    <div class="stat-grid">
      <div class="stat-item">
        <h4>Gesamt Mitarbeiter</h4>
        <p class="stat-number">${totalEmployees}</p>
      </div>
      <div class="stat-item">
        <h4>Home-Office Quote (aktueller Monat)</h4>
        <p class="stat-number">${homeOfficePercentage}%</p>
      </div>
      <div class="stat-item">
        <h4>Geplante Arbeitstage</h4>
        <p class="stat-number">${totalWorkDays}</p>
      </div>
      <div class="stat-item">
        <h4>Home-Office Tage</h4>
        <p class="stat-number">${totalHomeOfficeDays}</p>
      </div>
    </div>
  `;
  
  document.getElementById('teamStatistics').innerHTML = statisticsHTML;
}

function displayTodayTeamStatus(users, todayStatus) {
  const employees = Object.keys(users).filter(userId => 
    users[userId].profile && users[userId].profile.role === 'employee'
  );
  
  const statusHTML = employees.map(userId => {
    const user = users[userId];
    const status = todayStatus[userId] || 'buero';
    const statusInfo = statusTypes[status];
    
    return `
      <div class="team-member-card">
        <div class="member-info">
          <div class="member-status" style="background-color: ${statusInfo.color};">
            ${statusInfo.symbol}
          </div>
          <div>
            <strong>${user.profile.name}</strong>
            <div class="member-status-text">${statusInfo.name}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('todayTeamStatus').innerHTML = statusHTML;
}

async function loadEmployeeDetails() {
  if (!isOnline || !isFirebaseInitialized) {
    document.getElementById('employeeDetails').innerHTML = '<p>Mitarbeiter-Details sind nur online verfügbar.</p>';
    return;
  }
  
  try {
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    const employees = Object.keys(users).filter(userId => 
      users[userId].profile && users[userId].profile.role === 'employee'
    );
    
    const detailsHTML = employees.map(userId => {
      const user = users[userId];
      return `
        <div class="employee-detail-card card">
          <div class="card__body">
            <h4>${user.profile.name}</h4>
            <p><strong>Quote:</strong> ${user.profile.quota}%</p>
            <p><strong>Rolle:</strong> ${user.profile.role}</p>
            <div class="employee-actions">
              <button type="button" class="btn btn--sm btn--outline" onclick="resetEmployeePassword('${userId}')">
                Passwort zurücksetzen
              </button>
              <button type="button" class="btn btn--sm btn--error" onclick="deleteEmployee('${userId}')">
                Account löschen
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('employeeDetails').innerHTML = detailsHTML;
    
  } catch (error) {
    console.error('Error loading employee details:', error);
  }
}

async function resetEmployeePassword(userId) {
  if (!confirm('Möchten Sie das Passwort für diesen Mitarbeiter wirklich zurücksetzen?')) {
    return;
  }
  
  try {
    const defaultPasswordHash = await hashPassword('password123');
    await database.ref(`users/${userId}/profile/passwordHash`).set(defaultPasswordHash);
    alert('Passwort wurde auf "password123" zurückgesetzt.');
  } catch (error) {
    console.error('Error resetting password:', error);
    alert('Fehler beim Zurücksetzen des Passworts.');
  }
}

async function deleteEmployee(userId) {
  if (!confirm('Möchten Sie diesen Mitarbeiter-Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    return;
  }
  
  try {
    await database.ref(`users/${userId}`).remove();
    await database.ref(`plans/${userId}`).remove();
    alert('Mitarbeiter-Account wurde gelöscht.');
    loadEmployeeDetails();
  } catch (error) {
    console.error('Error deleting employee:', error);
    alert('Fehler beim Löschen des Accounts.');
  }
}

function initializeReports() {
  const reportMonth = document.getElementById('reportMonth');
  reportMonth.innerHTML = '';
  
  // Populate months for current year
  const currentYear = new Date().getFullYear();
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  monthNames.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
    option.textContent = `${month} ${currentYear}`;
    reportMonth.appendChild(option);
  });
  
  // Set current month as default
  const currentMonth = new Date().getMonth();
  reportMonth.value = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
}

async function generateReport() {
  const selectedMonth = document.getElementById('reportMonth').value;
  
  if (!isOnline || !isFirebaseInitialized) {
    document.getElementById('reportResults').innerHTML = '<p>Berichte sind nur online verfügbar.</p>';
    return;
  }
  
  try {
    showLoading(true);
    
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    const plansSnapshot = await database.ref('plans').once('value');
    const plans = plansSnapshot.val() || {};
    
    const employees = Object.keys(users).filter(userId => 
      users[userId].profile && users[userId].profile.role === 'employee'
    );
    
    let reportHTML = `<h4>Bericht für ${selectedMonth}</h4>`;
    reportHTML += '<div class="report-table">';
    
    employees.forEach(userId => {
      const user = users[userId];
      const monthPlans = plans[userId] && plans[userId][selectedMonth] ? plans[userId][selectedMonth] : {};
      
      const statusCounts = {
        homeoffice: 0,
        buero: 0,
        urlaub: 0,
        az: 0
      };
      
      Object.values(monthPlans).forEach(status => {
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
      
      const totalDays = Object.keys(monthPlans).length;
      const homeOfficePercentage = totalDays > 0 ? 
        Math.round((statusCounts.homeoffice / totalDays) * 100) : 0;
      
      reportHTML += `
        <div class="report-employee">
          <h5>${user.profile.name}</h5>
          <p>Home-Office: ${statusCounts.homeoffice} Tage (${homeOfficePercentage}%)</p>
          <p>Büro: ${statusCounts.buero} Tage</p>
          <p>Urlaub: ${statusCounts.urlaub} Tage</p>
          <p>AZ: ${statusCounts.az} Tage</p>
        </div>
      `;
    });
    
    reportHTML += '</div>';
    document.getElementById('reportResults').innerHTML = reportHTML;
    
  } catch (error) {
    console.error('Error generating report:', error);
    document.getElementById('reportResults').innerHTML = '<p>Fehler beim Erstellen des Berichts.</p>';
  } finally {
    showLoading(false);
  }
}

function exportData() {
  alert('Export-Funktionalität wird implementiert...');
}

// Settings Functions
function showSettingsModal() {
  document.getElementById('settingsModal').classList.remove('hidden');
}

async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Bitte füllen Sie alle Felder aus.');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('Neue Passwörter stimmen nicht überein.');
    return;
  }
  
  if (newPassword.length < 6) {
    alert('Neues Passwort muss mindestens 6 Zeichen lang sein.');
    return;
  }
  
  try {
    const currentPasswordHash = await hashPassword(currentPassword);
    const userRef = database.ref(`users/${currentUser.id}`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.profile.passwordHash === currentPasswordHash) {
        const newPasswordHash = await hashPassword(newPassword);
        await userRef.child('profile/passwordHash').set(newPasswordHash);
        
        alert('Passwort wurde erfolgreich geändert.');
        closeModal('settingsModal');
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      } else {
        alert('Aktuelles Passwort ist falsch.');
      }
    }
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Fehler beim Ändern des Passworts.');
  }
}

async function updateQuotaSettings() {
  const newQuota = document.getElementById('quotaSettings').value;
  
  if (newQuota < 0 || newQuota > 100) {
    alert('Quote muss zwischen 0 und 100% liegen.');
    return;
  }
  
  try {
    // Update quota for all employees
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    const updates = {};
    Object.keys(users).forEach(userId => {
      if (users[userId].profile && users[userId].profile.role === 'employee') {
        updates[`users/${userId}/profile/quota`] = parseInt(newQuota);
      }
    });
    
    await database.ref().update(updates);
    alert('Standard-Quote wurde für alle Mitarbeiter aktualisiert.');
    
  } catch (error) {
    console.error('Error updating quota:', error);
    alert('Fehler beim Aktualisieren der Quote.');
  }
}

function confirmAccountDeletion() {
  if (confirm('Möchten Sie Ihren Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    deleteCurrentUserAccount();
  }
}

async function deleteCurrentUserAccount() {
  try {
    await database.ref(`users/${currentUser.id}`).remove();
    await database.ref(`plans/${currentUser.id}`).remove();
    
    alert('Ihr Account wurde gelöscht.');
    logout();
    
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Fehler beim Löschen des Accounts.');
  }
}

// Modal Functions
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  
  // Clear error messages
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.classList.add('hidden');
    element.textContent = '';
  });
}

// Utility Functions
function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
  }
}

function showLoading(show) {
  const loader = document.getElementById('loadingIndicator');
  if (loader) {
    if (show) {
      loader.classList.remove('hidden');
    } else {
      loader.classList.add('hidden');
    }
  }
}

function updateConnectionStatus() {
  const statusElement = document.getElementById('connectionStatus');
  const messageElement = document.getElementById('connectionMessage');
  
  if (statusElement && messageElement) {
    if (isOnline && isFirebaseInitialized) {
      statusElement.className = 'connection-status connected';
      messageElement.textContent = 'Online';
      statusElement.classList.add('hidden'); // Hide when online
    } else {
      statusElement.className = 'connection-status offline';
      messageElement.textContent = isFirebaseInitialized ? 'Offline-Modus' : 'Verbindungsfehler';
      statusElement.classList.remove('hidden');
    }
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Event Listeners for modals (close on outside click)
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    const modalId = event.target.id;
    closeModal(modalId);
  }
});

// Back to calendar from team overview
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // Close any open modal
    const openModals = document.querySelectorAll('.modal:not(.hidden)');
    openModals.forEach(modal => {
      closeModal(modal.id);
    });
    
    // Return to calendar view if in team overview
    if (currentUser && !document.getElementById('teamOverviewPanel').classList.contains('hidden')) {
      document.getElementById('teamOverviewPanel').classList.add('hidden');
      document.getElementById('calendarView').classList.remove('hidden');
    }
  }
});

// Auto-sync when coming back online
window.addEventListener('online', function() {
  if (currentUser) {
    // Sync local data when coming back online
    syncLocalData();
  }
});

async function syncLocalData() {
  if (!currentUser || Object.keys(localData).length === 0) return;
  
  try {
    const updates = {};
    
    if (localData[currentUser.id]) {
      Object.keys(localData[currentUser.id]).forEach(monthKey => {
        Object.keys(localData[currentUser.id][monthKey]).forEach(dayKey => {
          updates[`plans/${currentUser.id}/${monthKey}/${dayKey}`] = localData[currentUser.id][monthKey][dayKey];
        });
      });
    }
    
    if (Object.keys(updates).length > 0) {
      await database.ref().update(updates);
      localData = {}; // Clear local data after sync
      console.log('Local data synced successfully');
    }
    
  } catch (error) {
    console.error('Error syncing local data:', error);
  }
}
