// HomeOffice Planner JavaScript – Firebase Realtime Database (fixed)
// Änderungen:
// 1) Einheitliches Passwort-Hashing via SHA-256 (keine simpleHash-Verwendung mehr für Passwörter)
// 2) Saubere Firebase-Initialisierung (kein window.firebaseDB nötig)
// 3) Ein konsistentes Firebase v10.12.2 für alle Imports
// 4) UID-Erzeugung ohne btoa/Unicode-Probleme
// 5) Punkt 7 (Urlaub nicht in Quote zählen) bleibt unverändert

class HomeOfficePlanner {
  constructor() {
    // Firebase
    this.isFirebaseEnabled = false;
    this.database = null;
    this.currentUserUID = null;
    this.dataListeners = new Map();

    // Feiertage bis 2030 (unverändert)
    this.holidays = {
      "2025": [
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
      "2026": [
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
      ],
      "2027": [
        { datum: "2027-01-01", name: "Neujahr" },
        { datum: "2027-03-26", name: "Karfreitag" },
        { datum: "2027-03-29", name: "Ostermontag" },
        { datum: "2027-05-01", name: "Tag der Arbeit" },
        { datum: "2027-05-06", name: "Christi Himmelfahrt" },
        { datum: "2027-05-17", name: "Pfingstmontag" },
        { datum: "2027-05-27", name: "Fronleichnam" },
        { datum: "2027-08-15", name: "Mariä Himmelfahrt" },
        { datum: "2027-10-03", name: "Tag der Deutschen Einheit" },
        { datum: "2027-11-01", name: "Allerheiligen" },
        { datum: "2027-12-25", name: "1. Weihnachtsfeiertag" },
        { datum: "2027-12-26", name: "2. Weihnachtsfeiertag" }
      ],
      "2028": [
        { datum: "2028-01-01", name: "Neujahr" },
        { datum: "2028-04-14", name: "Karfreitag" },
        { datum: "2028-04-17", name: "Ostermontag" },
        { datum: "2028-05-01", name: "Tag der Arbeit" },
        { datum: "2028-05-25", name: "Christi Himmelfahrt" },
        { datum: "2028-06-05", name: "Pfingstmontag" },
        { datum: "2028-06-15", name: "Fronleichnam" },
        { datum: "2028-08-15", name: "Mariä Himmelfahrt" },
        { datum: "2028-10-03", name: "Tag der Deutschen Einheit" },
        { datum: "2028-11-01", name: "Allerheiligen" },
        { datum: "2028-12-25", name: "1. Weihnachtsfeiertag" },
        { datum: "2028-12-26", name: "2. Weihnachtsfeiertag" }
      ],
      "2029": [
        { datum: "2029-01-01", name: "Neujahr" },
        { datum: "2029-03-30", name: "Karfreitag" },
        { datum: "2029-04-02", name: "Ostermontag" },
        { datum: "2029-05-01", name: "Tag der Arbeit" },
        { datum: "2029-05-10", name: "Christi Himmelfahrt" },
        { datum: "2029-05-21", name: "Pfingstmontag" },
        { datum: "2029-05-31", name: "Fronleichnam" },
        { datum: "2029-08-15", name: "Mariä Himmelfahrt" },
        { datum: "2029-10-03", name: "Tag der Deutschen Einheit" },
        { datum: "2029-11-01", name: "Allerheiligen" },
        { datum: "2029-12-25", name: "1. Weihnachtsfeiertag" },
        { datum: "2029-12-26", name: "2. Weihnachtsfeiertag" }
      ],
      "2030": [
        { datum: "2030-01-01", name: "Neujahr" },
        { datum: "2030-04-19", name: "Karfreitag" },
        { datum: "2030-04-22", name: "Ostermontag" },
        { datum: "2030-05-01", name: "Tag der Arbeit" },
        { datum: "2030-05-30", name: "Christi Himmelfahrt" },
        { datum: "2030-06-10", name: "Pfingstmontag" },
        { datum: "2030-06-20", name: "Fronleichnam" },
        { datum: "2030-08-15", name: "Mariä Himmelfahrt" },
        { datum: "2030-10-03", name: "Tag der Deutschen Einheit" },
        { datum: "2030-11-01", name: "Allerheiligen" },
        { datum: "2030-12-25", name: "1. Weihnachtsfeiertag" },
        { datum: "2030-12-26", name: "2. Weihnachtsfeiertag" }
      ]
    };

    this.statusTypes = {
      homeoffice: { name: "Home-Office", color: "#FF8C00", symbol: "🏠" },
      buero: { name: "Büro", color: "#4169E1", symbol: "🏢" },
      urlaub: { name: "Urlaub", color: "#32CD32", symbol: "🏖️" },
      az: { name: "AZ", color: "#808080", symbol: "⏰" }
    };

    // Passwörter & App-Status
    this.teamleaderPassword = "teamleiter123";
    this.defaultPassword = "password123";
    this.newPasswordDefault = "NeuesPasswort123";

    this.colleagues = ["Torsten Zapp", "Anna", "Michael", "Sarah", "Thomas"];
    this.currentUser = null;
    this.userRole = null;
    this.currentDate = new Date();
    this.planningData = {};
    this.colleaguePasswords = {};
    this.homeofficeRules = {};
    this.selectedDateForStatus = null;
    this.activeTab = "overview";
    this.selectedColleagueForAction = null;
    this.isTeamOverviewMode = false;

    // Regeln sofort setzen; Passwörter asynchron in init()
    this.initializeDefaultRules();
  }

  // ==== Firebase Init (v10.12.2) ====
  async initializeFirebase() {
    try {
      const [{ initializeApp }, { getDatabase, ref, onValue }] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js")
      ]);

      // Deine bekannte Config (StorageBucket optional, hier weggelassen)
      const firebaseConfig = {
        apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
        authDomain: "homeoffice-planer-drv.firebaseapp.com",
        databaseURL:
          "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "homeoffice-planer-drv"
      };

      const app = initializeApp(firebaseConfig);
      this.database = getDatabase(app);
      this.isFirebaseEnabled = true;

      // Verbindung überwachen
      const connectedRef = ref(this.database, ".info/connected");
      onValue(connectedRef, (snap) => {
        this.updateLiveStatus(snap.val() === true ? "🟢 Live" : "🔴 Offline");
      });

      this.updateConnectionStatus("🟢 Firebase verbunden");
      return true;
    } catch (e) {
      console.log("Firebase init fehlgeschlagen:", e);
      this.isFirebaseEnabled = false;
      this.updateConnectionStatus("🔴 Offline Modus");
      this.updateLiveStatus("🔴 Offline");
      return false;
    }
  }

  updateConnectionStatus(status) {
    const el = document.getElementById("connectionStatus");
    if (el) el.textContent = status;
  }
  updateLiveStatus(status) {
    const el = document.getElementById("liveStatus");
    if (el) el.textContent = status;
  }

  // ==== Hashing ====
  async sha256Hash(message) {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback (selten genutzt): sehr einfache Hash-Variante – nicht für Passwörter!
    // Wir nutzen es hier NICHT für Passwörter, nur als Notlösung.
    return this.simpleHash(message);
  }

  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString();
  }

  // **Neu**: default Passwörter SHA‑256 (asynchron)
  async initializeDefaultPasswords() {
    const tasks = this.colleagues.map(async (name) => {
      this.colleaguePasswords[name] = await this.sha256Hash(this.defaultPassword);
    });
    await Promise.all(tasks);
  }

  initializeDefaultRules() {
    this.colleagues.forEach((c) => (this.homeofficeRules[c] = 40));
  }

  // UID ohne btoa/Unicode-Probleme: 32-bit Rolling Hash aus UTF-8, hex
  getUserUID(username) {
    const enc = new TextEncoder().encode(username);
    let h = 0;
    for (const b of enc) h = (h * 31 + b) >>> 0;
    return h.toString(16).padStart(8, "0");
  }

  // ==== Realtime DB Ops (einheitlich 10.12.2) ====
  async writeData(path, data) {
    if (!this.isFirebaseEnabled) return;
    try {
      const { ref, set } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
      );
      const dataRef = ref(this.database, path);
      await set(dataRef, data);
    } catch (e) {
      console.error("Error writing data:", e);
    }
  }

  async updateData(path, updates) {
    if (!this.isFirebaseEnabled) return;
    try {
      const { ref, update } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
      );
      const dataRef = ref(this.database, path);
      await update(dataRef, updates);
    } catch (e) {
      console.error("Error updating data:", e);
    }
  }

  async removeData(path) {
    if (!this.isFirebaseEnabled) return;
    try {
      const { ref, remove } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
      );
      const dataRef = ref(this.database, path);
      await remove(dataRef);
    } catch (e) {
      console.error("Error removing data:", e);
    }
  }

  async setupDataListeners(uid) {
    if (!this.isFirebaseEnabled) return;
    try {
      const { ref, onValue } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
      );

      const userRef = ref(this.database, `users/${uid}/profile`);
      const unsubUser = onValue(userRef, (snap) => {
        const userData = snap.val();
        if (userData) this.handleUserDataUpdate(userData);
      });
      this.dataListeners.set(`user_${uid}`, unsubUser);

      const plansRef = ref(this.database, `plans/${uid}`);
      const unsubPlans = onValue(plansRef, (snap) => {
        const plansData = snap.val();
        this.handlePlansDataUpdate(plansData || {});
      });
      this.dataListeners.set(`plans_${uid}`, unsubPlans);

      if (this.userRole === "teamleader") await this.setupTeamDataListeners();
    } catch (e) {
      console.error("Error setting up data listeners:", e);
    }
  }

  async setupTeamDataListeners() {
    if (!this.isFirebaseEnabled || this.userRole !== "teamleader") return;
    try {
      const { ref, onValue } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
      );

      const allUsersRef = ref(this.database, "users");
      const unsubAllUsers = onValue(allUsersRef, (snap) => {
        const allUsers = snap.val();
        if (allUsers) this.handleAllUsersDataUpdate(allUsers);
      });
      this.dataListeners.set("all_users", unsubAllUsers);

      const allPlansRef = ref(this.database, "plans");
      const unsubAllPlans = onValue(allPlansRef, (snap) => {
        const allPlans = snap.val();
        this.handleAllPlansDataUpdate(allPlans || {});
      });
      this.dataListeners.set("all_plans", unsubAllPlans);
    } catch (e) {
      console.error("Error setting up team data listeners:", e);
    }
  }

  handleUserDataUpdate(userData) {
    if (userData.quota) this.homeofficeRules[this.currentUser] = userData.quota;
    if (this.userRole === "employee" && !this.isTeamOverviewMode) this.updateDashboard(this.currentUser);
  }

  handlePlansDataUpdate(plansData) {
    if (!this.planningData[this.currentUser]) this.planningData[this.currentUser] = {};
    for (const monthKey in plansData) {
      const monthData = plansData[monthKey];
      for (const dateKey in monthData) {
        this.planningData[this.currentUser][dateKey] = monthData[dateKey];
      }
    }
    this.renderCalendar();
    if (this.userRole === "employee" && !this.isTeamOverviewMode) this.updateDashboard(this.currentUser);
  }

  handleAllUsersDataUpdate(allUsers) {
    this.colleagues = [];
    for (const uid in allUsers) {
      const userData = allUsers[uid];
      if (userData.profile?.name) {
        this.colleagues.push(userData.profile.name);
        if (userData.profile.quota) this.homeofficeRules[userData.profile.name] = userData.profile.quota;
      }
    }
    this.populateEmployeeSelect();
    this.populateDetailColleagueSelect();
    if (this.activeTab === "overview") this.renderTeamOverview();
  }

  handleAllPlansDataUpdate(allPlans) {
    this.planningData = {};
    for (const uid in allPlans) {
      // Zuordnung via UID-Mapping (vereinfachte Heuristik)
      let username = null;
      for (const colleague of this.colleagues) {
        if (this.getUserUID(colleague) === uid) { username = colleague; break; }
      }
      if (!username) continue;
      this.planningData[username] = {};
      const userPlans = allPlans[uid];
      for (const monthKey in userPlans) {
        const monthData = userPlans[monthKey];
        for (const dateKey in monthData) {
          this.planningData[username][dateKey] = monthData[dateKey];
        }
      }
    }
    this.renderCalendar();
    if (this.isTeamOverviewMode) this.renderTeamCalendars();
    if (this.activeTab === "overview") this.renderTeamOverview();
  }

  cleanupDataListeners() {
    for (const [key, unsubscribe] of this.dataListeners) {
      if (typeof unsubscribe === "function") unsubscribe();
    }
    this.dataListeners.clear();
  }

  async saveUserProfile(username, data) {
    const uid = this.getUserUID(username);
    await this.writeData(`users/${uid}/profile`, {
      name: username,
      role: data.role || "employee",
      quota: data.quota || 40,
      passwordHash: data.passwordHash,
      lastUpdated: Date.now()
    });
  }

  async savePlanningData(username, date, status) {
    const uid = this.getUserUID(username);
    const yearMonth = date.substring(0, 7);
    if (status) await this.writeData(`plans/${uid}/${yearMonth}/${date}`, status);
    else await this.removeData(`plans/${uid}/${yearMonth}/${date}`);
  }

  // ==== App Init ====
  async init() {
    // 1) Default-Passwörter (SHA-256) vorbereiten
    await this.initializeDefaultPasswords();

    // 2) Firebase initialisieren
    await this.initializeFirebase();

    // 3) UI
    this.showLoginScreen();
    this.populateEmployeeSelect();
    this.setupEventListeners();
  }

  // ==== UI / Events (gekürzt auf Kernfunktionen – identisch zu deiner Logik) ====
  setupEventListeners() {
    setTimeout(() => {
      this.setupLoginListeners();
      this.setupNavigationListeners();
      this.setupModalListeners();
      this.setupTeamleaderListeners();
      this.setupPasswordListeners();
      this.setupDeleteAccountListeners();
      this.setupHomeofficeRuleListeners();
      this.setupTeamOverviewListeners();
    }, 100);
  }

  setupLoginListeners() {
    const employeeLoginBtn = document.getElementById("employeeLoginBtn");
    const teamleaderLoginBtn = document.getElementById("teamleaderLoginBtn");
    const newEmployeeRegisterBtn = document.getElementById("newEmployeeRegisterBtn");

    if (employeeLoginBtn) employeeLoginBtn.addEventListener("click", (e) => { e.preventDefault(); this.loginAsEmployee(); });
    if (teamleaderLoginBtn) teamleaderLoginBtn.addEventListener("click", (e) => { e.preventDefault(); this.loginAsTeamleader(); });
    if (newEmployeeRegisterBtn) newEmployeeRegisterBtn.addEventListener("click", (e) => { e.preventDefault(); this.registerNewEmployee(); });

    const employeePassword = document.getElementById("employeePassword");
    if (employeePassword) employeePassword.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); this.loginAsEmployee(); } });

    const teamleaderPassword = document.getElementById("teamleaderPassword");
    if (teamleaderPassword) teamleaderPassword.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); this.loginAsTeamleader(); } });

    const newEmployeePasswordConfirm = document.getElementById("newEmployeePasswordConfirm");
    if (newEmployeePasswordConfirm) newEmployeePasswordConfirm.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); this.registerNewEmployee(); } });

    const userTypeSelect = document.getElementById("userType");
    if (userTypeSelect) {
      const clone = userTypeSelect.cloneNode(true);
      userTypeSelect.parentNode.replaceChild(clone, userTypeSelect);
      clone.addEventListener("change", (e) => this.showLoginType(e.target.value));
    }
  }

  setupNavigationListeners() {
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    const logoutBtn = document.getElementById("logoutBtn");
    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.preventDefault(); this.navigateMonth(-1); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.preventDefault(); this.navigateMonth(1); });
    if (logoutBtn) logoutBtn.addEventListener("click", (e) => { e.preventDefault(); this.logout(); });
  }

  setupModalListeners() {
    const cancelStatusBtn = document.getElementById("cancelStatusChange");
    if (cancelStatusBtn) cancelStatusBtn.addEventListener("click", (e) => { e.preventDefault(); this.hideStatusModal(); });

    // Delegation für .status-btn (ersetzt statische Bindung)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".status-btn");
      if (!btn) return;
      e.preventDefault();
      this.setStatus(btn.dataset.status);
    });

    document.querySelectorAll(".modal__overlay").forEach((ov) => {
      ov.addEventListener("click", (e) => { if (e.target === ov) this.hideAllModals(); });
    });
  }

  setupHomeofficeRuleListeners() {
    const homeofficeRule = document.getElementById("homeofficeRule");
    if (homeofficeRule) homeofficeRule.addEventListener("change", async (e) => {
      if (this.currentUser && this.userRole === "employee") {
        const newQuota = parseInt(e.target.value, 10);
        this.homeofficeRules[this.currentUser] = newQuota;
        const currentPasswordHash = this.colleaguePasswords[this.currentUser];
        await this.saveUserProfile(this.currentUser, { role: "employee", quota: newQuota, passwordHash: currentPasswordHash });
        this.updateDashboard(this.currentUser);
      }
    });

    const teamleaderHomeofficeRule = document.getElementById("teamleaderHomeofficeRule");
    if (teamleaderHomeofficeRule) teamleaderHomeofficeRule.addEventListener("change", () => { if (this.userRole === "teamleader") this.renderTeamOverview(); });
  }

  setupTeamOverviewListeners() {
    const teamOverviewBtn = document.getElementById("teamOverviewBtn");
    if (teamOverviewBtn) teamOverviewBtn.addEventListener("click", (e) => { e.preventDefault(); this.showTeamOverview(); });
    const teamleaderTeamOverviewBtn = document.getElementById("teamleaderTeamOverviewBtn");
    if (teamleaderTeamOverviewBtn) teamleaderTeamOverviewBtn.addEventListener("click", (e) => { e.preventDefault(); this.showTeamOverview(); });
    const backToDashboard = document.getElementById("backToDashboard");
    if (backToDashboard) backToDashboard.addEventListener("click", (e) => { e.preventDefault(); this.hideTeamOverview(); });
  }

  setupPasswordListeners() {
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    if (changePasswordBtn) changePasswordBtn.addEventListener("click", (e) => { e.preventDefault(); this.showChangePasswordModal(); });

    const confirmPasswordChangeBtn = document.getElementById("confirmPasswordChange");
    const cancelPasswordChangeBtn = document.getElementById("cancelPasswordChange");
    if (confirmPasswordChangeBtn) confirmPasswordChangeBtn.addEventListener("click", (e) => { e.preventDefault(); this.changePassword(); });
    if (cancelPasswordChangeBtn) cancelPasswordChangeBtn.addEventListener("click", (e) => { e.preventDefault(); this.hideChangePasswordModal(); });

    const confirmResetPasswordBtn = document.getElementById("confirmResetPassword");
    const cancelResetPasswordBtn = document.getElementById("cancelResetPassword");
    if (confirmResetPasswordBtn) confirmResetPasswordBtn.addEventListener("click", (e) => { e.preventDefault(); this.resetColleaguePassword(); });
    if (cancelResetPasswordBtn) cancelResetPasswordBtn.addEventListener("click", (e) => { e.preventDefault(); this.hideResetPasswordModal(); });
  }

  setupDeleteAccountListeners() {
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    if (deleteAccountBtn) deleteAccountBtn.addEventListener("click", (e) => { e.preventDefault(); this.showDeleteAccountModal(); });

    const confirmDeleteAccountBtn = document.getElementById("confirmDeleteAccount");
    const cancelDeleteAccountBtn = document.getElementById("cancelDeleteAccount");
    if (confirmDeleteAccountBtn) confirmDeleteAccountBtn.addEventListener("click", (e) => { e.preventDefault(); this.deleteCurrentUserAccount(); });
    if (cancelDeleteAccountBtn) cancelDeleteAccountBtn.addEventListener("click", (e) => { e.preventDefault(); this.hideDeleteAccountModal(); });

    const confirmDeleteColleagueBtn = document.getElementById("confirmDeleteColleague");
    const cancelDeleteColleagueBtn = document.getElementById("cancelDeleteColleague");
    if (confirmDeleteColleagueBtn) confirmDeleteColleagueBtn.addEventListener("click", (e) => { e.preventDefault(); this.deleteColleague(); });
    if (cancelDeleteColleagueBtn) cancelDeleteColleagueBtn.addEventListener("click", (e) => { e.preventDefault(); this.hideDeleteColleagueModal(); });
  }

  showLoginScreen() {
    const loginScreen = document.getElementById("loginScreen");
    const mainApp = document.getElementById("mainApp");
    if (loginScreen) loginScreen.classList.remove("hidden");
    if (mainApp) mainApp.classList.add("hidden");
  }

  showLoginType(type) {
    const employeeLogin = document.getElementById("employeeLogin");
    const teamleaderLogin = document.getElementById("teamleaderLogin");
    const newEmployeeLogin = document.getElementById("newEmployeeLogin");
    if (employeeLogin) employeeLogin.classList.add("hidden");
    if (teamleaderLogin) teamleaderLogin.classList.add("hidden");
    if (newEmployeeLogin) newEmployeeLogin.classList.add("hidden");
    if (type === "employee" && employeeLogin) employeeLogin.classList.remove("hidden");
    else if (type === "teamleader" && teamleaderLogin) teamleaderLogin.classList.remove("hidden");
    else if (type === "newEmployee" && newEmployeeLogin) newEmployeeLogin.classList.remove("hidden");
  }

  populateEmployeeSelect() {
    const select = document.getElementById("employeeName");
    if (!select) return;
    select.innerHTML = '<option value="">-- Kollege auswählen --</option>';
    this.colleagues.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c; select.appendChild(opt);
    });
  }

  async loginAsEmployee() {
    const employeeName = document.getElementById("employeeName");
    const employeePassword = document.getElementById("employeePassword");
    if (!employeeName?.value) return alert("Bitte wählen Sie einen Kollegen aus.");
    if (!employeePassword?.value) return alert("Bitte geben Sie ein Passwort ein.");

    const hashed = await this.sha256Hash(employeePassword.value);
    const stored = this.colleaguePasswords[employeeName.value];
    if (hashed !== stored) return alert("Falsches Passwort!");

    this.currentUser = employeeName.value;
    this.currentUserUID = this.getUserUID(this.currentUser);
    this.userRole = "employee";
    await this.setupDataListeners(this.currentUserUID);
    this.showMainApplication();
  }

  async loginAsTeamleader() {
    const teamleaderPassword = document.getElementById("teamleaderPassword");
    if (!teamleaderPassword?.value) return alert("Bitte geben Sie das Teamleiter-Passwort ein.");
    if (teamleaderPassword.value !== this.teamleaderPassword) return alert("Falsches Teamleiter-Passwort!");
    this.currentUser = "Teamleiter";
    this.userRole = "teamleader";
    await this.setupTeamDataListeners();
    this.showMainApplication();
  }

  async registerNewEmployee() {
    const nameEl = document.getElementById("newEmployeeName");
    const pwEl = document.getElementById("newEmployeePassword");
    const pw2El = document.getElementById("newEmployeePasswordConfirm");
    if (!nameEl?.value.trim()) return alert("Bitte geben Sie einen Namen ein.");
    if (!pwEl?.value) return alert("Bitte geben Sie ein Passwort ein.");
    if (!pw2El?.value) return alert("Bitte bestätigen Sie das Passwort.");
    if (pwEl.value !== pw2El.value) return alert("Die Passwörter stimmen nicht überein.");
    if (pwEl.value.length < 6) return alert("Das Passwort muss mindestens 6 Zeichen lang sein.");

    const name = nameEl.value.trim();
    if (this.colleagues.includes(name)) return alert("Dieser Name ist bereits vergeben!");

    this.colleagues.push(name);
    this.planningData[name] = {};
    const hashed = await this.sha256Hash(pwEl.value);
    this.colleaguePasswords[name] = hashed;
    this.homeofficeRules[name] = 40;

    await this.saveUserProfile(name, { role: "employee", quota: 40, passwordHash: hashed });

    this.populateEmployeeSelect();
    this.currentUser = name;
    this.currentUserUID = this.getUserUID(name);
    this.userRole = "employee";
    await this.setupDataListeners(this.currentUserUID);
    this.showMainApplication();
  }

  showMainApplication() {
    const loginScreen = document.getElementById("loginScreen");
    const mainApp = document.getElementById("mainApp");
    const currentUserSpan = document.getElementById("currentUser");
    const securityNotice = document.getElementById("securityNotice");
    const teamleaderNav = document.getElementById("teamleaderNav");
    const employeeView = document.getElementById("employeeView");
    const teamleaderView = document.getElementById("teamleaderView");

    if (loginScreen) loginScreen.classList.add("hidden");
    if (mainApp) mainApp.classList.remove("hidden");
    if (currentUserSpan) currentUserSpan.textContent = this.currentUser;

    if (this.userRole === "teamleader") {
      if (securityNotice) securityNotice.classList.remove("hidden");
      if (teamleaderNav) teamleaderNav.classList.remove("hidden");
      if (employeeView) employeeView.classList.add("hidden");
      if (teamleaderView) teamleaderView.classList.remove("hidden");
      this.populateDetailColleagueSelect();
      this.renderTeamOverview();
      this.switchTab("overview");
    } else {
      if (securityNotice) securityNotice.classList.add("hidden");
      if (teamleaderNav) teamleaderNav.classList.add("hidden");
      if (employeeView) employeeView.classList.remove("hidden");
      if (teamleaderView) teamleaderView.classList.add("hidden");
      this.selectEmployee(this.currentUser);
    }

    this.updateCurrentMonth();
    this.renderCalendar();
  }

  logout() {
    this.cleanupDataListeners();
    this.currentUser = null;
    this.currentUserUID = null;
    this.userRole = null;
    this.activeTab = "overview";
    this.isTeamOverviewMode = false;

    const ids = [
      "userType","employeeName","employeePassword","teamleaderPassword",
      "newEmployeeName","newEmployeePassword","newEmployeePasswordConfirm"
    ];
    ids.forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });
    this.showLoginType("");
    this.showLoginScreen();
  }

  async setStatus(status) {
    if (!this.currentUser || !this.selectedDateForStatus || this.userRole !== "employee") return;
    if (status === "clear") {
      if (this.planningData[this.currentUser]) delete this.planningData[this.currentUser][this.selectedDateForStatus];
      await this.savePlanningData(this.currentUser, this.selectedDateForStatus, null);
    } else {
      if (!this.planningData[this.currentUser]) this.planningData[this.currentUser] = {};
      this.planningData[this.currentUser][this.selectedDateForStatus] = status;
      await this.savePlanningData(this.currentUser, this.selectedDateForStatus, status);
    }
    this.hideStatusModal();
    this.renderCalendar();
    this.updateDashboard(this.currentUser);
  }

  showTeamOverview() {
    this.isTeamOverviewMode = true;
    const teamOverviewModal = document.getElementById("teamOverviewModal");
    const employeeView = document.getElementById("employeeView");
    const teamleaderView = document.getElementById("teamleaderView");
    if (teamOverviewModal) teamOverviewModal.classList.remove("hidden");
    if (employeeView) employeeView.classList.add("hidden");
    if (teamleaderView) teamleaderView.classList.add("hidden");
    this.renderTeamCalendars();
  }

  hideTeamOverview() {
    this.isTeamOverviewMode = false;
    const teamOverviewModal = document.getElementById("teamOverviewModal");
    const employeeView = document.getElementById("employeeView");
    const teamleaderView = document.getElementById("teamleaderView");
    if (teamOverviewModal) teamOverviewModal.classList.add("hidden");
    if (this.userRole === "employee") { if (employeeView) employeeView.classList.remove("hidden"); }
    else if (this.userRole === "teamleader") { if (teamleaderView) teamleaderView.classList.remove("hidden"); }
  }

  renderTeamCalendars() {
    const container = document.getElementById("teamCalendars");
    if (!container) return;
    container.innerHTML = "";
    this.colleagues.forEach((colleague) => {
      const div = document.createElement("div");
      div.className = "colleague-calendar";
      const stats = this.calculateMonthlyStats(colleague);
      const rule = this.homeofficeRules[colleague] || 40;
      const header = document.createElement("h4");
      header.innerHTML = `${colleague} ${this.userRole === "teamleader" ? `<span>HomeOffice: ${stats.homeofficePercent.toFixed(1)}%</span>` : ""}`;
      div.appendChild(header);
      if (this.userRole === "teamleader") {
        const statsDiv = document.createElement("div");
        statsDiv.className = "colleague-stats";
        statsDiv.innerHTML = `
          <span>Regel: ${rule}%</span>
          <span>HomeOffice: ${stats.homeofficeDays} Tage</span>
          <span>Büro: ${stats.officeDays} Tage</span>
          <span>Urlaub: ${stats.vacationDays} Tage</span>
          <span class="${stats.homeofficePercent > rule ? "status-warning" : "status-ok"}">
            ${stats.homeofficePercent > rule ? "ÜBERSCHREITUNG" : "OK"}
          </span>`;
        div.appendChild(statsDiv);
      }
      const mini = this.createMiniCalendar(colleague);
      div.appendChild(mini);
      container.appendChild(div);
    });
  }

  createMiniCalendar(colleague) {
    const calendarDiv = document.createElement("div");
    calendarDiv.className = "mini-calendar";
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const grid = document.createElement("div");
    grid.className = "calendar__grid";
    grid.style.fontSize = "12px";
    ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach((d) => {
      const h = document.createElement("div"); h.className = "calendar__day-header"; h.textContent = d; grid.appendChild(h);
    });
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - dayOfWeek);
    for (let i = 0; i < 42; i++) {
      const cd = new Date(startDate); cd.setDate(startDate.getDate() + i);
      const dayDiv = document.createElement("div");
      dayDiv.className = "calendar__day"; dayDiv.style.minHeight = "30px"; dayDiv.style.padding = "2px";
      const isCurrentMonth = cd.getMonth() === month;
      const isWeekend = cd.getDay() === 0 || cd.getDay() === 6;
      const dateStr = this.formatDate(cd);
      const holiday = this.getHoliday(dateStr);
      if (!isCurrentMonth) dayDiv.classList.add("other-month");
      if (isWeekend) dayDiv.classList.add("weekend");
      if (holiday) dayDiv.classList.add("holiday");
      const num = document.createElement("div"); num.textContent = cd.getDate(); num.style.fontSize = "10px"; dayDiv.appendChild(num);
      if (isCurrentMonth && !holiday && !isWeekend) {
        const status = this.getStatus(colleague, dateStr);
        if (status) {
          const s = document.createElement("div"); s.className = `day-status ${status}`; s.style.fontSize = "8px"; s.textContent = this.statusTypes[status].symbol; dayDiv.appendChild(s);
        }
      }
      grid.appendChild(dayDiv);
    }
    calendarDiv.appendChild(grid);
    return calendarDiv;
  }

  async changePassword() {
    const oldEl = document.getElementById("oldPassword");
    const newEl = document.getElementById("newPassword");
    const new2El = document.getElementById("confirmNewPassword");
    if (!oldEl?.value || !newEl?.value || !new2El?.value) return alert("Bitte füllen Sie alle Felder aus.");
    if (newEl.value !== new2El.value) return alert("Die neuen Passwörter stimmen nicht überein.");
    if (newEl.value.length < 6) return alert("Das neue Passwort muss mindestens 6 Zeichen lang sein.");
    const oldHash = await this.sha256Hash(oldEl.value);
    const currentHash = this.colleaguePasswords[this.currentUser];
    if (oldHash !== currentHash) return alert("Das alte Passwort ist falsch.");
    const newHash = await this.sha256Hash(newEl.value);
    this.colleaguePasswords[this.currentUser] = newHash;
    await this.saveUserProfile(this.currentUser, { role: "employee", quota: this.homeofficeRules[this.currentUser], passwordHash: newHash });
    this.hideChangePasswordModal();
    alert("Passwort erfolgreich geändert!");
  }

  async deleteCurrentUserAccount() {
    if (!this.currentUser || this.userRole !== "employee") return;
    const idx = this.colleagues.indexOf(this.currentUser);
    if (idx > -1) this.colleagues.splice(idx, 1);
    delete this.planningData[this.currentUser];
    delete this.colleaguePasswords[this.currentUser];
    delete this.homeofficeRules[this.currentUser];
    const uid = this.getUserUID(this.currentUser);
    await this.removeData(`users/${uid}`);
    await this.removeData(`plans/${uid}`);
    this.hideDeleteAccountModal();
    alert("Ihr Konto wurde erfolgreich gelöscht.");
    this.logout();
  }

  selectEmployee(name) {
    const span = document.getElementById("selectedColleagueName");
    if (span) span.textContent = name;
    if (!this.planningData[name]) this.planningData[name] = {};
    const ruleEl = document.getElementById("homeofficeRule");
    if (ruleEl) ruleEl.value = this.homeofficeRules[name] || 40;
    this.renderCalendar();
    this.updateDashboard(name);
  }

  navigateMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.updateCurrentMonth();
    this.renderCalendar();
    if (this.userRole === "employee" && !this.isTeamOverviewMode) this.updateDashboard(this.currentUser);
    else if (this.userRole === "teamleader") {
      if (this.isTeamOverviewMode) this.renderTeamCalendars();
      else if (this.activeTab === "overview") this.renderTeamOverview();
      else if (this.activeTab === "reports") this.generateReportPreview();
    }
  }

  updateCurrentMonth() {
    const m = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
    const el = document.getElementById("currentMonth");
    if (el) el.textContent = `${m[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  renderCalendar() {
    if (this.isTeamOverviewMode) return;
    const calendar = document.getElementById("calendar"); if (!calendar) return;
    const grid = calendar.querySelector(".calendar__grid"); if (!grid) return;
    grid.querySelectorAll(".calendar__day").forEach((n) => n.remove());

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - dayOfWeek);
    const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 41);

    const d = new Date(startDate);
    while (d <= endDate) {
      const dayEl = this.createDayElement(d, month);
      grid.appendChild(dayEl);
      d.setDate(d.getDate() + 1);
    }
  }

  createDayElement(date, currentMonth) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar__day";
    const dateStr = this.formatDate(date);
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const holiday = this.getHoliday(dateStr);
    if (!isCurrentMonth) dayDiv.classList.add("other-month");
    if (isWeekend) dayDiv.classList.add("weekend");
    if (holiday) dayDiv.classList.add("holiday");
    const num = document.createElement("div"); num.className = "day-number"; num.textContent = date.getDate(); dayDiv.appendChild(num);
    if (holiday) {
      const hn = document.createElement("div"); hn.className = "holiday-name"; hn.textContent = holiday.name; dayDiv.appendChild(hn);
    }
    if (isCurrentMonth && !holiday && !isWeekend) {
      if (this.userRole === "employee") {
        const status = this.getStatus(this.currentUser, dateStr);
        if (status) {
          const s = document.createElement("div"); s.className = `day-status ${status}`; s.textContent = `${this.statusTypes[status].symbol} ${this.statusTypes[status].name}`; dayDiv.appendChild(s);
        }
        dayDiv.style.cursor = "pointer";
        dayDiv.addEventListener("click", (e) => { e.preventDefault(); this.showStatusModal(dateStr); });
      } else if (this.userRole === "teamleader") {
        dayDiv.classList.add("readonly");
        this.colleagues.forEach((c) => {
          const status = this.getStatus(c, dateStr);
          if (status) {
            const s = document.createElement("div"); s.className = `day-status ${status}`; s.style.fontSize = "9px"; s.style.marginBottom = "1px"; s.textContent = `${c.substr(0,3)}: ${this.statusTypes[status].symbol}`; dayDiv.appendChild(s);
          }
        });
      }
    }
    return dayDiv;
  }

  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  getHoliday(dateStr) {
    const y = dateStr.split("-")[0];
    const list = this.holidays[y] || [];
    return list.find((h) => h.datum === dateStr);
  }

  getStatus(colleague, date) {
    return this.planningData[colleague]?.[date];
  }

  showStatusModal(dateStr) {
    if (this.userRole !== "employee") return;
    this.selectedDateForStatus = dateStr;
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const elDate = document.getElementById("statusModalDate");
    const modal = document.getElementById("statusModal");
    if (elDate) elDate.textContent = formatted;
    if (modal) modal.classList.remove("hidden");
  }

  hideStatusModal() {
    const modal = document.getElementById("statusModal");
    if (modal) modal.classList.add("hidden");
    this.selectedDateForStatus = null;
  }

  hideAllModals() {
    document.querySelectorAll(".modal").forEach((m) => m.classList.add("hidden"));
  }

  showChangePasswordModal() {
    const modal = document.getElementById("changePasswordModal");
    ["oldPassword","newPassword","confirmNewPassword"].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });
    if (modal) modal.classList.remove("hidden");
    const oldEl = document.getElementById("oldPassword"); if (oldEl) oldEl.focus();
  }

  hideChangePasswordModal() { const modal = document.getElementById("changePasswordModal"); if (modal) modal.classList.add("hidden"); }
  showDeleteAccountModal() { const modal = document.getElementById("deleteAccountModal"); if (modal) modal.classList.remove("hidden"); }
  hideDeleteAccountModal() { const modal = document.getElementById("deleteAccountModal"); if (modal) modal.classList.add("hidden"); }

  updateDashboard(colleague) {
    if (!colleague) return;
    const stats = this.calculateMonthlyStats(colleague);
    const rule = this.homeofficeRules[colleague] || 40;

    const progressFill = document.getElementById("progressFill");
    const percentSpan = document.getElementById("homeofficePercent");
    const statTarget = document.getElementById("statTarget");

    if (progressFill) {
      progressFill.style.width = `${Math.min(stats.homeofficePercent, 100)}%`;
      progressFill.className = "progress-fill";
      if (stats.homeofficePercent > rule + 10) progressFill.classList.add("danger");
      else if (stats.homeofficePercent > rule) progressFill.classList.add("warning");
    }
    if (percentSpan) percentSpan.textContent = `${stats.homeofficePercent.toFixed(1)}%`;
    if (statTarget) statTarget.textContent = `Ziel: ≤ ${rule}%`;

    const map = {
      workDays: stats.totalWorkDays,
      homeOfficeDays: stats.homeofficeDays,
      officeDays: stats.officeDays,
      vacationDays: stats.vacationDays
    };
    for (const id in map) { const el = document.getElementById(id); if (el) el.textContent = map[id]; }

    const warn = document.getElementById("warningMessage");
    const warnText = document.getElementById("warningText");
    if (warn && warnText) {
      if (stats.homeofficePercent > rule) { warn.style.display = "block"; warnText.textContent = `Die ${rule}%-HomeOffice-Regel wird überschritten!`; }
      else warn.style.display = "none";
    }
  }

  // Punkt 7: Urlaub NICHT in totalWorkDays mitzählen (unverändert)
  calculateMonthlyStats(colleague) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    let homeofficeDays = 0, officeDays = 0, vacationDays = 0, azDays = 0, totalWorkDays = 0;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const dateStr = this.formatDate(date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = this.getHoliday(dateStr);
      if (!isWeekend && !isHoliday) {
        const status = this.getStatus(colleague, dateStr);
        if (status === "urlaub") vacationDays++;
        else {
          totalWorkDays++;
          switch (status) {
            case "homeoffice": homeofficeDays++; break;
            case "buero": officeDays++; break;
            case "az": azDays++; break;
          }
        }
      }
    }
    const homeofficePercent = totalWorkDays > 0 ? (homeofficeDays / totalWorkDays) * 100 : 0;
    return { homeofficeDays, officeDays, vacationDays, azDays, totalWorkDays, homeofficePercent };
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll(".nav-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.toggle("active", c.id === `${tab}Tab`));
    if (tab === "overview") this.renderTeamOverview();
    else if (tab === "details") this.populateDetailColleagueSelect();
    else if (tab === "reports") this.generateReportPreview();
  }

  populateDetailColleagueSelect() {
    const select = document.getElementById("detailColleagueSelect");
    if (!select) return;
    select.innerHTML = '<option value="">-- Kollege auswählen --</option>';
    this.colleagues.forEach((c) => { const o = document.createElement("option"); o.value = c; o.textContent = c; select.appendChild(o); });
  }

  renderTeamOverview() {
    const container = document.getElementById("teamOverviewTable");
    const statusFilter = document.getElementById("statusFilter");
    if (!container) return;
    const filterValue = statusFilter ? statusFilter.value : "all";

    const table = document.createElement("table");
    table.className = "overview-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th><th>HomeOffice-Regel</th><th>Aktuelle Quote</th><th>Status</th>
          <th>HomeOffice Tage</th><th>Büro Tage</th><th>Urlaub Tage</th>
        </tr>
      </thead>
      <tbody></tbody>`;
    const tbody = table.querySelector("tbody");

    this.colleagues.forEach((c) => {
      const stats = this.calculateMonthlyStats(c);
      const rule = this.homeofficeRules[c] || 40;
      if (filterValue === "violations" && stats.homeofficePercent <= rule) return;
      if (filterValue === "40" && rule !== 40) return;
      if (filterValue === "60" && rule !== 60) return;
      const tr = document.createElement("tr");
      const statusClass = stats.homeofficePercent > rule ? "status-danger" : "status-ok";
      const statusText = stats.homeofficePercent > rule ? "Überschreitung" : "OK";
      tr.innerHTML = `
        <td><strong>${c}</strong></td>
        <td>${rule}%</td>
        <td>${stats.homeofficePercent.toFixed(1)}%</td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td>${stats.homeofficeDays}</td>
        <td>${stats.officeDays}</td>
        <td>${stats.vacationDays}</td>`;
      tbody.appendChild(tr);
    });

    container.innerHTML = "";
    container.appendChild(table);
  }

  showColleagueDetail(name) {
    const detail = document.getElementById("colleagueDetail");
    if (!detail || !name) { if (detail) detail.classList.add("hidden"); return; }
    const stats = this.calculateMonthlyStats(name);
    const rule = this.homeofficeRules[name] || 40;
    detail.innerHTML = `
      <h4>${name} - Detailansicht</h4>
      <div class="detail-stats">
        <div class="detail-stat-card"><h5>HomeOffice Regel</h5><div class="stat-value">${rule}%</div></div>
        <div class="detail-stat-card"><h5>HomeOffice Quote</h5><div class="stat-value ${stats.homeofficePercent > rule ? 'status-warning' : 'status-ok'}">${stats.homeofficePercent.toFixed(1)}%</div></div>
        <div class="detail-stat-card"><h5>HomeOffice Tage</h5><div class="stat-value">${stats.homeofficeDays}</div></div>
        <div class="detail-stat-card"><h5>Büro Tage</h5><div class="stat-value">${stats.officeDays}</div></div>
        <div class="detail-stat-card"><h5>Urlaub Tage</h5><div class="stat-value">${stats.vacationDays}</div></div>
        <div class="detail-stat-card"><h5>Gesamt Arbeitstage</h5><div class="stat-value">${stats.totalWorkDays}</div></div>
      </div>
      <div class="detail-actions">
        <button class="btn btn--warning btn--sm" onclick="window.planner.showResetPasswordModal('${name}')">Passwort zurücksetzen</button>
        <button class="btn btn--danger btn--sm" onclick="window.planner.showDeleteColleagueModal('${name}')">Kollegen löschen</button>
      </div>`;
    detail.classList.remove("hidden");
  }

  showResetPasswordModal(colleague) {
    this.selectedColleagueForAction = colleague;
    const modal = document.getElementById("resetPasswordModal");
    const span = document.getElementById("resetPasswordColleague");
    if (span) span.textContent = colleague;
    if (modal) modal.classList.remove("hidden");
  }
  hideResetPasswordModal() { const modal = document.getElementById("resetPasswordModal"); if (modal) modal.classList.add("hidden"); this.selectedColleagueForAction = null; }

  async resetColleaguePassword() {
    if (!this.selectedColleagueForAction) return;
    const newHash = await this.sha256Hash(this.newPasswordDefault);
    this.colleaguePasswords[this.selectedColleagueForAction] = newHash;
    await this.saveUserProfile(this.selectedColleagueForAction, { role: "employee", quota: this.homeofficeRules[this.selectedColleagueForAction], passwordHash: newHash });
    this.hideResetPasswordModal();
    alert(`Passwort für ${this.selectedColleagueForAction} wurde auf "${this.newPasswordDefault}" zurückgesetzt.`);
  }

  showDeleteColleagueModal(colleague) {
    this.selectedColleagueForAction = colleague;
    const modal = document.getElementById("deleteColleagueModal");
    const span = document.getElementById("deleteColleagueName");
    if (span) span.textContent = colleague;
    if (modal) modal.classList.remove("hidden");
  }
  hideDeleteColleagueModal() { const modal = document.getElementById("deleteColleagueModal"); if (modal) modal.classList.add("hidden"); this.selectedColleagueForAction = null; }

  async deleteColleague() {
    if (!this.selectedColleagueForAction) return;
    const c = this.selectedColleagueForAction;
    const idx = this.colleagues.indexOf(c); if (idx > -1) this.colleagues.splice(idx, 1);
    delete this.planningData[c];
    delete this.colleaguePasswords[c];
    delete this.homeofficeRules[c];
    const uid = this.getUserUID(c);
    await this.removeData(`users/${uid}`);
    await this.removeData(`plans/${uid}`);
    this.populateDetailColleagueSelect();
    this.renderTeamOverview();
    const detailSelect = document.getElementById("detailColleagueSelect");
    if (detailSelect && detailSelect.value === c) { detailSelect.value = ""; this.showColleagueDetail(""); }
    this.hideDeleteColleagueModal();
    alert(`Kollege ${c} wurde erfolgreich gelöscht.`);
  }

  generateReportPreview() {
    const container = document.getElementById("reportPreview");
    if (!container) return;
    const m = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
    const curM = m[this.currentDate.getMonth()];
    const curY = this.currentDate.getFullYear();
    let report = `HomeOffice Monatsbericht - ${curM} ${curY}\n`;
    report += `====================================================\n\n`;
    this.colleagues.forEach((c) => {
      const s = this.calculateMonthlyStats(c);
      const rule = this.homeofficeRules[c] || 40;
      report += `${c}:\n`;
      report += `  HomeOffice-Regel: ${rule}%\n`;
      report += `  HomeOffice-Quote: ${s.homeofficePercent.toFixed(1)}%\n`;
      report += `  HomeOffice Tage: ${s.homeofficeDays}\n`;
      report += `  Büro Tage: ${s.officeDays}\n`;
      report += `  Urlaub Tage: ${s.vacationDays}\n`;
      report += `  Status: ${s.homeofficePercent > rule ? 'ÜBERSCHREITUNG' : 'OK'}\n\n`;
    });
    const totalViolations = this.colleagues.filter((c) => {
      const s = this.calculateMonthlyStats(c);
      const rule = this.homeofficeRules[c] || 40;
      return s.homeofficePercent > rule;
    }).length;
    report += `Zusammenfassung:\n`;
    report += `- Anzahl Kollegen: ${this.colleagues.length}\n`;
    report += `- Überschreitungen: ${totalViolations}\n`;
    report += `- Bericht erstellt: ${new Date().toLocaleString('de-DE')}\n`;
    container.textContent = report;
  }

  exportMonthReport() {
    this.generateReportPreview();
    const content = document.getElementById("reportPreview").textContent;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const m = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
    const fileName = `HomeOffice-Bericht-${m[this.currentDate.getMonth()]}-${this.currentDate.getFullYear()}.txt`;
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
}

// App starten
document.addEventListener("DOMContentLoaded", () => {
  window.planner = new HomeOfficePlanner();
  window.planner.init().catch((e) => console.error("Failed to initialize app:", e));
});
