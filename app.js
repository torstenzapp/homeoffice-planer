// HomeOffice-Planer mit Firebase Live-Sync
// Firebase Config mit Ihren echten Daten
const firebaseConfig = {
  apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
  authDomain: "homeoffice-planer-drv.firebaseapp.com",
  databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "homeoffice-planer-drv",
  storageBucket: "homeoffice-planer-drv.firebasestorage.app",
  messagingSenderId: "669565818222",
  appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
};

// Global variables
let app, database;
let currentUser = null;
let currentDate = new Date();
let listeners = [];

// Feiertage Saarland 2025-2030
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

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
  console.log('App starting...');
  
  // Initialize Firebase
  try {
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    showError('Firebase-Verbindung fehlgeschlagen');
    return;
  }
  
  // Initialize Service Worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('service-worker.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
  
  setupEventListeners();
  await loadUsers();
});

// Event Listeners
function setupEventListeners() {
  // User type selection
  document.getElementById('userType').addEventListener('change', handleUserTypeChange);
  
  // Login buttons
  document.getElementById('employeeLoginBtn').addEventListener('click', handleEmployeeLogin);
  document.getElementById('teamleaderLoginBtn').addEventListener('click', handleTeamleaderLogin);
  document.getElementById('newEmployeeRegisterBtn').addEventListener('click', handleNewEmployeeRegister);
  
  // Dashboard buttons
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('teamOverviewBtn').addEventListener('click', showTeamOverview);
  document.getElementById('changePasswordBtn').addEventListener('click', showPasswordModal);
  document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
  
  // Calendar navigation
  document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));
  
  // Quota selection
  document.getElementById('quotaSelect').addEventListener('change', handleQuotaChange);
  
  // Team overview
  document.getElementById('backToMain').addEventListener('click', showDashboard);
  
  // Password modal
  document.getElementById('savePasswordBtn').addEventListener('click', saveNewPassword);
  document.getElementById('cancelPasswordBtn').addEventListener('click', hidePasswordModal);
}

// User type change handler
function handleUserTypeChange(e) {
  const value = e.target.value;
  hideAllLoginForms();
  
  if (value === 'employee') {
    document.getElementById('employeeLogin').classList.remove('hidden');
  } else if (value === 'teamleader') {
    document.getElementById('teamleaderLogin').classList.remove('hidden');
  } else if (value === 'newEmployee') {
    document.getElementById('newEmployeeForm').classList.remove('hidden');
  }
}

function hideAllLoginForms() {
  document.getElementById('employeeLogin').classList.add('hidden');
  document.getElementById('teamleaderLogin').classList.add('hidden');
  document.getElementById('newEmployeeForm').classList.add('hidden');
  document.getElementById('errorMessage').classList.add('hidden');
}

// Load users from Firebase
async function loadUsers() {
  try {
    const snapshot = await database.ref('users').once('value');
    const users = snapshot.val() || {};
    
    const employeeSelect = document.getElementById('employeeName');
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
    console.error('Error loading users:', error);
  }
}

// Hash password with SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Employee login
async function handleEmployeeLogin() {
  const userId = document.getElementById('employeeName').value;
  const password = document.getElementById('employeePassword').value;
  
  if (!userId || !password) {
    showError('Bitte wählen Sie einen Namen und geben Sie das Passwort ein');
    return;
  }
  
  try {
    const hashedPassword = await hashPassword(password);
    const snapshot = await database.ref(`users/${userId}/profile`).once('value');
    const profile = snapshot.val();
    
    if (!profile) {
      showError('Benutzer nicht gefunden');
      return;
    }
    
    if (profile.passwordHash !== hashedPassword) {
      showError('Passwort falsch');
      return;
    }
    
    currentUser = {
      id: userId,
      name: profile.name,
      role: 'employee',
      quota: profile.quota || 40
    };
    
    showDashboard();
  } catch (error) {
    console.error('Login error:', error);
    showError('Anmeldung fehlgeschlagen');
  }
}

// Teamleader login
async function handleTeamleaderLogin() {
  const password = document.getElementById('teamleaderPassword').value;
  
  if (!password) {
    showError('Bitte geben Sie das Teamleiter-Passwort ein');
    return;
  }
  
  const hashedPassword = await hashPassword(password);
  const expectedHash = await hashPassword('teamleiter123');
  
  if (hashedPassword !== expectedHash) {
    showError('Teamleiter-Passwort falsch');
    return;
  }
  
  currentUser = {
    id: 'teamleader',
    name: 'Teamleiter',
    role: 'teamleader',
    quota: 60
  };
  
  showDashboard();
}

// New employee registration
async function handleNewEmployeeRegister() {
  const name = document.getElementById('newEmployeeName').value.trim();
  const password = document.getElementById('newEmployeePassword').value;
  const passwordConfirm = document.getElementById('newEmployeePasswordConfirm').value;
  
  if (!name || !password || !passwordConfirm) {
    showError('Bitte füllen Sie alle Felder aus');
    return;
  }
  
  if (password !== passwordConfirm) {
    showError('Passwörter stimmen nicht überein');
    return;
  }
  
  try {
    const userId = name.toLowerCase().replace(/\s+/g, '-');
    const hashedPassword = await hashPassword(password);
    
    // Check if user already exists
    const existingUser = await database.ref(`users/${userId}`).once('value');
    if (existingUser.val()) {
      showError('Benutzer existiert bereits');
      return;
    }
    
    // Create new user
    await database.ref(`users/${userId}`).set({
      profile: {
        name: name,
        role: 'employee',
        quota: 40,
        passwordHash: hashedPassword,
        createdAt: new Date().toISOString()
      }
    });
    
    currentUser = {
      id: userId,
      name: name,
      role: 'employee',
      quota: 40
    };
    
    await loadUsers(); // Refresh user list
    showDashboard();
  } catch (error) {
    console.error('Registration error:', error);
    showError('Registrierung fehlgeschlagen');
  }
}

// Show dashboard
function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  document.getElementById('teamOverviewScreen').classList.add('hidden');
  
  document.getElementById('dashboardTitle').textContent = `Willkommen, ${currentUser.name}`;
  document.getElementById('quotaSelect').value = currentUser.quota;
  
  renderCalendar();
  updateQuotaDisplay();
  
  // Hide team management buttons for regular employees
  if (currentUser.role !== 'teamleader') {
    // Show team overview button for all users
  }
}

// Show team overview
function showTeamOverview() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.add('hidden');
  document.getElementById('teamOverviewScreen').classList.remove('hidden');
  
  renderTeamOverview();
}

// Render calendar
async function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const monthHeader = document.getElementById('currentMonth');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  monthHeader.textContent = currentDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });
  
  // Clear calendar
  calendar.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
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
  try {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const snapshot = await database.ref(`plans/${currentUser.id}/${monthKey}`).once('value');
    userPlans = snapshot.val() || {};
  } catch (error) {
    console.error('Error loading plans:', error);
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
      day.style.opacity = '0.3';
      day.style.cursor = 'default';
    } else {
      // Check if holiday
      const holidayYear = cellDate.getFullYear().toString();
      const isHoliday = holidays[holidayYear]?.some(h => h.datum === dateKey);
      
      if (isHoliday) {
        day.classList.add('holiday');
      } else {
        // Check if today
        const today = new Date();
        if (cellDate.toDateString() === today.toDateString()) {
          day.classList.add('today');
        }
        
        // Check if has status
        if (userPlans[dateKey]) {
          day.classList.add('has-status', `status-${userPlans[dateKey]}`);
          const symbols = {
            homeoffice: '🏠',
            buero: '🏢',
            urlaub: '🏖️',
            az: '⏰'
          };
          day.textContent = `${cellDate.getDate()} ${symbols[userPlans[dateKey]] || ''}`;
        }
        
        // Add click handler
        day.addEventListener('click', () => handleDayClick(dateKey));
      }
    }
    
    calendar.appendChild(day);
  }
}

// Handle day click
async function handleDayClick(dateKey) {
  const statuses = ['', 'homeoffice', 'buero', 'urlaub', 'az'];
  const statusNames = ['Leer', 'Home-Office', 'Büro', 'Urlaub', 'AZ'];
  
  try {
    const [year, month] = dateKey.split('-');
    const monthKey = `${year}-${month}`;
    
    // Get current status
    const snapshot = await database.ref(`plans/${currentUser.id}/${monthKey}/${dateKey}`).once('value');
    const currentStatus = snapshot.val() || '';
    
    // Find next status
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    // Update in Firebase
    if (nextStatus === '') {
      await database.ref(`plans/${currentUser.id}/${monthKey}/${dateKey}`).remove();
    } else {
      await database.ref(`plans/${currentUser.id}/${monthKey}/${dateKey}`).set(nextStatus);
    }
    
    // Refresh calendar
    renderCalendar();
    updateQuotaDisplay();
    
  } catch (error) {
    console.error('Error updating status:', error);
    showError('Fehler beim Speichern');
  }
}

// Change month
function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
  updateQuotaDisplay();
}

// Update quota display
async function updateQuotaDisplay() {
  try {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    
    const snapshot = await database.ref(`plans/${currentUser.id}/${monthKey}`).once('value');
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
    console.error('Error updating quota:', error);
  }
}

// Handle quota change
async function handleQuotaChange(e) {
  const newQuota = parseInt(e.target.value);
  currentUser.quota = newQuota;
  
  // Save to Firebase if not teamleader
  if (currentUser.role !== 'teamleader') {
    try {
      await database.ref(`users/${currentUser.id}/profile/quota`).set(newQuota);
    } catch (error) {
      console.error('Error saving quota:', error);
    }
  }
  
  updateQuotaDisplay();
}

// Render team overview
async function renderTeamOverview() {
  const teamGrid = document.getElementById('teamGrid');
  teamGrid.innerHTML = '';
  
  try {
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    for (const userId of Object.keys(users)) {
      const user = users[userId];
      if (!user.profile || user.profile.role !== 'employee') continue;
      
      const memberDiv = document.createElement('div');
      memberDiv.className = 'team-member';
      
      // Get user's current month plans
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      
      const plansSnapshot = await database.ref(`plans/${userId}/${monthKey}`).once('value');
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
          ${currentUser.role === 'teamleader' ? `<span class="team-member-quota">${quota}%</span>` : ''}
        </div>
        <div class="team-member-calendar" id="team-calendar-${userId}"></div>
      `;
      
      teamGrid.appendChild(memberDiv);
      
      // Render mini calendar for this user
      renderMiniCalendar(userId, plans);
    }
    
  } catch (error) {
    console.error('Error loading team overview:', error);
  }
}

// Render mini calendar for team member
function renderMiniCalendar(userId, plans) {
  const container = document.getElementById(`team-calendar-${userId}`);
  if (!container) return;
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
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
    dayElement.style.padding = '2px';
    dayElement.style.border = '1px solid #eee';
    dayElement.style.borderRadius = '2px';
    
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
    }
    
    container.appendChild(dayElement);
  }
}

// Show password modal
function showPasswordModal() {
  document.getElementById('passwordModal').classList.remove('hidden');
}

// Hide password modal
function hidePasswordModal() {
  document.getElementById('passwordModal').classList.add('hidden');
  // Clear form
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

// Save new password
async function saveNewPassword() {
  const currentPw = document.getElementById('currentPassword').value;
  const newPw = document.getElementById('newPassword').value;
  const confirmPw = document.getElementById('confirmPassword').value;
  
  if (!currentPw || !newPw || !confirmPw) {
    showError('Bitte füllen Sie alle Felder aus');
    return;
  }
  
  if (newPw !== confirmPw) {
    showError('Neue Passwörter stimmen nicht überein');
    return;
  }
  
  try {
    // Verify current password
    const currentHash = await hashPassword(currentPw);
    const snapshot = await database.ref(`users/${currentUser.id}/profile/passwordHash`).once('value');
    const storedHash = snapshot.val();
    
    if (currentHash !== storedHash) {
      showError('Aktuelles Passwort falsch');
      return;
    }
    
    // Save new password
    const newHash = await hashPassword(newPw);
    await database.ref(`users/${currentUser.id}/profile/passwordHash`).set(newHash);
    
    hidePasswordModal();
    showError('Passwort erfolgreich geändert', 'success');
    
  } catch (error) {
    console.error('Error changing password:', error);
    showError('Fehler beim Ändern des Passworts');
  }
}

// Delete account
async function deleteAccount() {
  if (!confirm('Möchten Sie Ihr Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    return;
  }
  
  try {
    await database.ref(`users/${currentUser.id}`).remove();
    await database.ref(`plans/${currentUser.id}`).remove();
    
    logout();
    showError('Konto wurde gelöscht', 'success');
    
  } catch (error) {
    console.error('Error deleting account:', error);
    showError('Fehler beim Löschen des Kontos');
  }
}

// Logout
function logout() {
  // Clean up listeners
  listeners.forEach(listener => {
    if (listener.off) listener.off();
  });
  listeners = [];
  
  currentUser = null;
  currentDate = new Date();
  
  // Reset forms
  document.getElementById('userType').value = '';
  hideAllLoginForms();
  
  // Show login screen
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('dashboardScreen').classList.add('hidden');
  document.getElementById('teamOverviewScreen').classList.add('hidden');
  
  // Reload users
  loadUsers();
}

// Show error message
function showError(message, type = 'error') {
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  errorElement.className = type === 'success' ? 'success-message' : 'error-message';
  errorElement.classList.remove('hidden');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.add('hidden');
  }, 5000);
}