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

// KORREKTUR: Globales Array für Kollegen (FIX für Problem 1)
let colleagues = ['Torsten', 'Anna', 'Michael', 'Sarah', 'Thomas'];
let userData = {
  'Torsten': { password: 'password123_hash', quota: 40 },
  'Anna': { password: 'password123_hash', quota: 40 },
  'Michael': { password: 'password123_hash', quota: 40 },
  'Sarah': { password: 'password123_hash', quota: 40 },
  'Thomas': { password: 'password123_hash', quota: 40 }
};
let planningData = {};

// KORREKTUR: Deutsche Feiertage korrekt strukturiert (FIX für Problem 3)
const holidays = {
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
  ]
};

// Status types
const statusTypes = {
  homeoffice: {name: "Home-Office", color: "#FF8C00", symbol: "🏠"},
  buero: {name: "Büro", color: "#4169E1", symbol: "🏢"},
  urlaub: {name: "Urlaub", color: "#32CD32", symbol: "🏖️"},
  az: {name: "AZ", color: "#808080", symbol: "⏰"}
};

// SHA-256 Hash function
async function sha256(message) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error hashing password:', error);
    return btoa(message).replace(/[^a-zA-Z0-9]/g, '');
  }
}

// Initialize Firebase with better error handling
function initializeFirebase() {
  try {
    console.log('Initializing Firebase...');
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    isFirebaseInitialized = true;
    
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

// KORREKTUR: populateEmployeeSelect() Funktion (FIX für Problem 1)
function populateEmployeeSelect() {
  console.log('populateEmployeeSelect called, colleagues:', colleagues);
  const select = document.getElementById('employeeName');
  if (!select) {
    console.error('Employee select element not found!');
    return;
  }
  
  // Alle Optionen löschen außer erste
  select.innerHTML = '<option value="">Wählen Sie Ihren Namen</option>';
  
  // Alle Kollegen hinzufügen
  colleagues.forEach(colleague => {
    const option = document.createElement('option');
    option.value = colleague;
    option.textContent = colleague;
    select.appendChild(option);
    console.log('Added option:', colleague);
  });
  
  console.log('Employee select populated with', colleagues.length, 'options');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded, initializing app...');
  
  // KORREKTUR: Sofort aufrufen, nicht mit Timeout
  initializeApp();
  setupEventListeners();
  // KORREKTUR: populateEmployeeSelect direkt beim Start aufrufen (FIX für Problem 1)
  populateEmployeeSelect();
  initializeDefaultData();
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
    const firebaseReady = initializeFirebase();
    
    if (firebaseReady) {
      console.log('Firebase initialized successfully');
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

function initializeDefaultData() {
  // KORREKTUR: Default userData bereits oben definiert
  console.log('Default data initialized with users:', Object.keys(userData));
}

async function initializeDefaultUsers() {
  if (!isFirebaseInitialized) {
    console.log('Firebase not initialized, skipping user initialization');
    return;
  }
  
  try {
    console.log('Initializing default users...');
    const defaultPasswordHash = await sha256('password123');
    const teamLeaderPasswordHash = await sha256('teamleiter123');
    
    // Update local userData with correct hashes
    colleagues.forEach(name => {
      userData[name] = { password: defaultPasswordHash, quota: 40 };
    });
    
    for (const userName of colleagues) {
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
  // KORREKTUR: populateEmployeeSelect nochmal aufrufen um sicher zu gehen
  populateEmployeeSelect();
  document.getElementById('employeeLoginModal').classList.remove('hidden');
  const errorElement = document.getElementById('employeeLoginError');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

function showTeamLeaderLogin() {
  console.log('Showing team leader login modal');
  document.getElementById('teamLeaderLoginModal').classList.remove('hidden');
  const errorElement = document.getElementById('teamLeaderLoginError');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

function showNewEmployeeForm() {
  console.log('Showing new employee form modal');
  document.getElementById('newEmployeeModal').classList.remove('hidden');
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
  
  try {
    showLoading(true);
    console.log('Hashing password...');
    const passwordHash = await sha256(password);
    
    let loginSuccess = false;
    
    // KORREKTUR: Erst lokale Daten prüfen, dann Firebase
    if (userData[name]) {
      const storedHash = userData[name].password;
      console.log('Local hash check:', passwordHash.substring(0, 10), '==', storedHash.substring(0, 10));
      if (storedHash === passwordHash) {
        currentUser = {
          id: name.toLowerCase(),
          name: name,
          role: 'employee',
          quota: userData[name].quota
        };
        loginSuccess = true;
        console.log('Local login successful');
      }
    }
    
    // Falls lokaler Login fehlschlägt, Firebase versuchen
    if (!loginSuccess && isFirebaseInitialized && isOnline) {
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
            console.log('Firebase login successful!');
            
            currentUser = {
              id: name.toLowerCase(),
              name: userData.profile.name,
              role: userData.profile.role,
              quota: userData.profile.quota
            };
            
            loginSuccess = true;
          }
        }
      }
    }
    
    if (loginSuccess) {
      console.log('User logged in:', currentUser);
      closeModal('employeeLoginModal');
      showMainApp();
    } else {
      console.log('Login failed');
      showError(errorElement, 'Falsches Passwort oder Benutzer nicht gefunden.');
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
  
  try {
    showLoading(true);
    const passwordHash = await sha256(password);
    
    let loginSuccess = false;
    
    // KORREKTUR: Default Teamleiter Passwort prüfen
    const defaultHash = await sha256('teamleiter123');
    if (passwordHash === defaultHash) {
      loginSuccess = true;
      console.log('Teamleiter login with default password successful');
    }
    
    if (!loginSuccess && isFirebaseInitialized && isOnline) {
      const userRef = database.ref('users/teamleiter');
      const snapshot = await userRef.once('value');
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.profile && userData.profile.passwordHash === passwordHash) {
          loginSuccess = true;
          console.log('Teamleiter Firebase login successful');
        }
      }
    }
    
    if (loginSuccess) {
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
  } catch (error) {
    console.error('Team leader login error:', error);
    showError(errorElement, 'Anmeldefehler: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// KORREKTUR: registerNewEmployee mit populateEmployeeSelect() (FIX für Problem 1)
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
  
  if (colleagues.includes(name)) {
    showError(errorElement, 'Ein Benutzer mit diesem Namen existiert bereits.');
    return;
  }
  
  try {
    showLoading(true);
    
    const passwordHash = await sha256(password);
    
    // WICHTIG: Neuen Mitarbeiter zu Array hinzufügen (FIX für Problem 1)
    colleagues.push(name);
    console.log('Added new colleague:', name, 'Total colleagues:', colleagues.length);
    
    // Passwort hashen und speichern
    userData[name] = { password: passwordHash, quota: 40 };
    console.log('Added user data for:', name);
    
    if (isFirebaseInitialized && isOnline) {
      const userId = name.toLowerCase().replace(/\s+/g, '_');
      const userRef = database.ref(`users/${userId}`);
      
      await userRef.set({
        profile: {
          name: name,
          role: 'employee',
          quota: 40,
          passwordHash: passwordHash,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        }
      });
      console.log('User saved to Firebase');
    }
    
    // KRITISCH: Select-Menü aktualisieren (FIX für Problem 1)
    populateEmployeeSelect();
    console.log('Employee select updated');
    
    currentUser = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
      role: 'employee',
      quota: 40
    };
    
    console.log('New employee registered:', name, 'Updated colleagues:', colleagues);
    
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
    // Hide dashboard for team leaders
    document.getElementById('dashboard').style.display = 'none';
  } else {
    // Show dashboard for employees
    document.getElementById('dashboard').style.display = 'block';
    // KORREKTUR: updateDashboard beim Login aufrufen (FIX für Problem 2)
    updateDashboard(currentUser.name);
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

// KORREKTUR: calculateMonthlyStats Funktion (FIX für Problem 2)
function calculateMonthlyStats(username) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  let homeOfficeDays = 0;
  let officeDays = 0;
  let vacationDays = 0;
  let totalWorkDays = 0;
  
  // Alle Tage des aktuellen Monats durchgehen
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateForStorage(date);
    const dayOfWeek = date.getDay();
    
    // Prüfungen
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = getHoliday(dateStr);
    
    if (!isWeekend && !isHoliday) {
      const status = getStatus(username, dateStr);
      
      if (status === 'urlaub') {
        vacationDays++;
      } else {
        totalWorkDays++;
        if (status === 'homeoffice') homeOfficeDays++;
        else if (status === 'buero') officeDays++;
        // Default is buero if no status set
        else officeDays++;
      }
    }
  }
  
  const homeofficePercent = totalWorkDays > 0 ? (homeOfficeDays / totalWorkDays) * 100 : 0;
  
  console.log('Monthly stats for', username, ':', {
    homeOfficeDays, officeDays, vacationDays, totalWorkDays, homeofficePercent
  });
  
  return {
    homeOfficeDays,
    officeDays, 
    vacationDays,
    totalWorkDays,
    homeofficePercent
  };
}

// KORREKTUR: updateDashboard Funktion (FIX für Problem 2)
function updateDashboard(username) {
  console.log('Updating dashboard for:', username);
  const stats = calculateMonthlyStats(username);
  const quota = userData[username]?.quota || 40;
  
  // Progress Bar
  const progressFill = document.getElementById('progressFill');
  if (progressFill) {
    const percentage = Math.min(stats.homeofficePercent, 100);
    progressFill.style.width = percentage + '%';
    
    // Farbe basierend auf Quote
    if (stats.homeofficePercent > quota + 10) {
      progressFill.className = 'progress-fill danger';
    } else if (stats.homeofficePercent > quota) {
      progressFill.className = 'progress-fill warning';
    } else {
      progressFill.className = 'progress-fill';
    }
    console.log('Progress bar updated:', percentage + '%');
  }
  
  // Prozent-Anzeige
  const percentSpan = document.getElementById('homeofficePercent');
  if (percentSpan) {
    percentSpan.textContent = stats.homeofficePercent.toFixed(1) + '%';
    console.log('Percentage display updated:', stats.homeofficePercent.toFixed(1) + '%');
  }
  
  // Statistiken
  const homeOfficeDaysElement = document.getElementById('homeOfficeDays');
  const officeDaysElement = document.getElementById('officeDays');
  const vacationDaysElement = document.getElementById('vacationDays');
  
  if (homeOfficeDaysElement) homeOfficeDaysElement.textContent = stats.homeOfficeDays;
  if (officeDaysElement) officeDaysElement.textContent = stats.officeDays;
  if (vacationDaysElement) vacationDaysElement.textContent = stats.vacationDays;
  
  console.log('Dashboard updated successfully');
}

// KORREKTUR: getHoliday Funktion (FIX für Problem 3)
function getHoliday(dateStr) {
  const year = dateStr.substring(0, 4);
  const holidaysForYear = holidays[year];
  
  if (!holidaysForYear) return null;
  
  const holiday = holidaysForYear.find(holiday => holiday.datum === dateStr);
  if (holiday) {
    console.log('Found holiday:', holiday.name, 'on', dateStr);
  }
  return holiday;
}

// KORREKTUR: formatDateForStorage Funktion (FIX für Problem 3)
function formatDateForStorage(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStatus(username, dateStr) {
  // Check local data first
  const [year, month] = dateStr.split('-');
  const monthKey = `${year}-${month}`;
  
  if (planningData[username] && planningData[username][monthKey] && planningData[username][monthKey][dateStr]) {
    return planningData[username][monthKey][dateStr];
  }
  
  if (localData[username] && localData[username][monthKey] && localData[username][monthKey][dateStr]) {
    return localData[username][monthKey][dateStr];
  }
  
  return null; // No status set, will default to office
}

// Calendar Functions
function updateCalendar() {
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  generateCalendarDays();
  
  // KORREKTUR: Dashboard bei Kalender-Update aktualisieren (FIX für Problem 2)
  if (currentUser && currentUser.role === 'employee') {
    updateDashboard(currentUser.name);
  }
}

function generateCalendarDays() {
  const calendarGrid = document.querySelector('.calendar-grid');
  
  // Remove existing day elements but keep headers
  const existingDays = calendarGrid.querySelectorAll('.calendar-day');
  existingDays.forEach(day => day.remove());
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start
  const daysInMonth = lastDay.getDate();
  
  const today = new Date();
  
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
  
  const dateString = formatDateForStorage(date);
  const dayNumber = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isToday = dateString === formatDateForStorage(new Date());
  const holiday = getHoliday(dateString);
  const isHoliday = holiday !== null;
  
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
  
  // Holiday name - KORREKTUR: Korrekte Anzeige (FIX für Problem 3)
  if (isHoliday) {
    const holidayElement = document.createElement('div');
    holidayElement.className = 'day-holiday';
    holidayElement.textContent = holiday.name;
    dayElement.appendChild(holidayElement);
    console.log('Added holiday to calendar:', holiday.name, 'on', dateString);
  }
  
  // Status display
  const statusElement = document.createElement('div');
  statusElement.className = 'day-status';
  dayElement.appendChild(statusElement);
  
  // Load and display status if user is logged in
  if (currentUser && !isOtherMonth) {
    const status = getStatus(currentUser.name, dateString);
    if (status && statusTypes[status]) {
      statusElement.classList.add(status);
      statusElement.textContent = statusTypes[status].symbol;
    }
  }
  
  // Add click handler for weekdays only
  if (!isWeekend && !isHoliday && !isOtherMonth && currentUser && currentUser.role !== 'teamleader') {
    dayElement.addEventListener('click', () => openStatusModal(dateString));
    dayElement.style.cursor = 'pointer';
  } else {
    dayElement.style.cursor = 'default';
  }
  
  return dayElement;
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
  document.getElementById('selectedDate').textContent = formatDateDisplay(dateString);
  document.getElementById('statusModal').classList.remove('hidden');
}

async function setDayStatus(status) {
  if (!selectedDateForStatus || !currentUser) return;
  
  try {
    const [year, month] = selectedDateForStatus.split('-');
    const monthKey = `${year}-${month}`;
    const dayKey = selectedDateForStatus;
    
    // Initialize user data structure if needed
    if (!planningData[currentUser.name]) planningData[currentUser.name] = {};
    if (!planningData[currentUser.name][monthKey]) planningData[currentUser.name][monthKey] = {};
    
    planningData[currentUser.name][monthKey][dayKey] = status;
    console.log('Status set:', currentUser.name, dayKey, status);
    
    if (isOnline && isFirebaseInitialized) {
      await database.ref(`plans/${currentUser.id}/${monthKey}/${dayKey}`).set(status);
    } else {
      // Store locally for offline mode
      if (!localData[currentUser.name]) localData[currentUser.name] = {};
      if (!localData[currentUser.name][monthKey]) localData[currentUser.name][monthKey] = {};
      localData[currentUser.name][monthKey][dayKey] = status;
    }
    
    closeModal('statusModal');
    updateCalendarDay(selectedDateForStatus, status);
    
    // KORREKTUR: Dashboard nach Status-Änderung aktualisieren (FIX für Problem 2)
    if (currentUser.role === 'employee') {
      updateDashboard(currentUser.name);
    }
    
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
    
    if (planningData[currentUser.name] && planningData[currentUser.name][monthKey]) {
      delete planningData[currentUser.name][monthKey][dayKey];
    }
    
    if (isOnline && isFirebaseInitialized) {
      await database.ref(`plans/${currentUser.id}/${monthKey}/${dayKey}`).remove();
    } else {
      // Remove locally for offline mode
      if (localData[currentUser.name] && localData[currentUser.name][monthKey]) {
        delete localData[currentUser.name][monthKey][dayKey];
      }
    }
    
    closeModal('statusModal');
    updateCalendarDay(selectedDateForStatus, null);
    
    // KORREKTUR: Dashboard nach Status-Entfernung aktualisieren (FIX für Problem 2)
    if (currentUser.role === 'employee') {
      updateDashboard(currentUser.name);
    }
    
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
    const elementDateString = formatDateForStorage(elementDate);
    
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
      if (localData[currentUser.name] && localData[currentUser.name][monthKey]) {
        monthData = localData[currentUser.name][monthKey];
      }
    }
    
    // Store in planning data
    if (!planningData[currentUser.name]) planningData[currentUser.name] = {};
    planningData[currentUser.name][monthKey] = monthData;
    
    // Update calendar with loaded data
    Object.keys(monthData).forEach(dateString => {
      updateCalendarDay(dateString, monthData[dateString]);
    });
    
    // KORREKTUR: Dashboard nach Daten-Laden aktualisieren (FIX für Problem 2)
    if (currentUser.role === 'employee') {
      updateDashboard(currentUser.name);
    }
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Team Leader Functions
function showTeamOverview() {
  document.getElementById('calendarView').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
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
  // Show simplified team overview for offline mode
  const teamStatistics = document.getElementById('teamStatistics');
  const todayTeamStatus = document.getElementById('todayTeamStatus');
  
  if (teamStatistics) {
    teamStatistics.innerHTML = `
      <div class="stat-grid">
        <div class="stat-item">
          <h4>Gesamt Mitarbeiter</h4>
          <p class="stat-number">${colleagues.length}</p>
        </div>
        <div class="stat-item">
          <h4>Registrierte Mitarbeiter</h4>
          <p class="stat-number">${Object.keys(userData).length}</p>
        </div>
      </div>
    `;
  }
  
  if (todayTeamStatus) {
    const statusHTML = colleagues.map(colleague => {
      return `
        <div class="team-member-card">
          <div class="member-info">
            <div class="member-status" style="background-color: #4169E1;">
              🏢
            </div>
            <div>
              <strong>${colleague}</strong>
              <div class="member-status-text">Büro (Standard)</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    todayTeamStatus.innerHTML = statusHTML;
  }
}

function loadEmployeeDetails() {
  const detailsHTML = colleagues.map(colleague => {
    const quota = userData[colleague]?.quota || 40;
    return `
      <div class="employee-detail-card card">
        <div class="card__body">
          <h4>${colleague}</h4>
          <p><strong>Quote:</strong> ${quota}%</p>
          <p><strong>Rolle:</strong> employee</p>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('employeeDetails').innerHTML = detailsHTML;
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

function generateReport() {
  alert('Bericht-Funktionalität wird implementiert...');
}

function exportData() {
  alert('Export-Funktionalität wird implementiert...');
}

// Settings Functions
function showSettingsModal() {
  document.getElementById('settingsModal').classList.remove('hidden');
}

function changePassword() {
  alert('Passwort-Änderung wird implementiert...');
}

function updateQuotaSettings() {
  alert('Quota-Update wird implementiert...');
}

function confirmAccountDeletion() {
  if (confirm('Möchten Sie Ihren Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    alert('Account-Löschung wird implementiert...');
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

function formatDateDisplay(dateString) {
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
      if (currentUser.role === 'employee') {
        document.getElementById('dashboard').classList.remove('hidden');
      }
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
    
    if (localData[currentUser.name]) {
      Object.keys(localData[currentUser.name]).forEach(monthKey => {
        Object.keys(localData[currentUser.name][monthKey]).forEach(dayKey => {
          updates[`plans/${currentUser.id}/${monthKey}/${dayKey}`] = localData[currentUser.name][monthKey][dayKey];
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