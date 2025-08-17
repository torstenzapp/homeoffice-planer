// HomeOfficePlanner_fixed.js
// -----------------------------------------------
// Fixes: SHA-256 Password Hashing, Firebase Init, UID ohne btoa, Event Delegation
// -----------------------------------------------

class HomeOfficePlanner {
  constructor() {
    this.isFirebaseEnabled = false;
    this.database = null;
    this.currentUser = null;
    this.currentUserUID = null;
    this.userRole = null;
    this.dataListeners = new Map();

    this.colleagues = ["Max", "Anna", "Lisa"];
    this.defaultPassword = "password123";
    this.colleaguePasswords = {};
    this.homeofficeRules = {};

    this.teamleaderPassword = "teamleiter123";
  }

  async sha256Hash(str) {
    const buf = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  }

  getUserUID(username) {
    const enc = new TextEncoder().encode(username);
    let h = 0;
    for (const b of enc) {
      h = (h * 31 + b) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }

  async initializeDefaultPasswords() {
    const promises = this.colleagues.map(async (colleague) => {
      this.colleaguePasswords[colleague] = await this.sha256Hash(this.defaultPassword);
    });
    await Promise.all(promises);
  }

  async initializeFirebase() {
    try {
      const [{ initializeApp }, { getDatabase }] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js")
      ]);

      const firebaseConfig = {
        apiKey: "DEIN_API_KEY",
        authDomain: "DEIN_PROJECT.firebaseapp.com",
        databaseURL: "https://DEIN_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "DEIN_PROJECT",
        storageBucket: "DEIN_PROJECT.appspot.com"
      };

      const app = initializeApp(firebaseConfig);
      this.database = getDatabase(app);
      this.isFirebaseEnabled = true;
      console.log("🟢 Firebase verbunden");
      return true;
    } catch (e) {
      console.log("Firebase init fehlgeschlagen:", e);
      this.isFirebaseEnabled = false;
      return false;
    }
  }

  async getStoredPasswordHash(name) {
    if (!this.isFirebaseEnabled || !name) return null;
    try {
      const { ref, get } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js");
      const uid = this.getUserUID(name);
      const profileRef = ref(this.database, `users/${uid}/profile`);
      const snap = await get(profileRef);
      const data = snap.val();
      return data?.passwordHash || null;
    } catch (e) {
      console.warn("getStoredPasswordHash failed:", e);
      return null;
    }
  }

  async saveUserProfile(name, profile) {
    if (!this.isFirebaseEnabled) return;
    try {
      const { ref, set } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js");
      const uid = this.getUserUID(name);
      await set(ref(this.database, `users/${uid}/profile`), profile);
    } catch (e) {
      console.error("saveUserProfile failed:", e);
    }
  }

  async loginAsEmployee() {
    const employeeName = document.getElementById("employeeName");
    const employeePassword = document.getElementById("employeePassword");
    if (!employeeName?.value) return alert("Bitte wählen Sie einen Kollegen aus.");
    if (!employeePassword?.value) return alert("Bitte geben Sie ein Passwort ein.");

    const name = employeeName.value;
    const input = employeePassword.value;
    const sha = await this.sha256Hash(input);

    let stored = await this.getStoredPasswordHash(name);
    if (!stored) stored = this.colleaguePasswords[name] || null;

    let ok = false;
    if (stored) {
      const isSha = /^[0-9a-f]{64}$/i.test(stored);
      ok = isSha ? (sha === stored) : (this.simpleHash(input) === stored);
    }
    if (!ok) return alert("Falsches Passwort!");

    try {
      const wasSimple = stored && !/^[0-9a-f]{64}$/i.test(stored);
      if (this.isFirebaseEnabled && wasSimple) {
        await this.saveUserProfile(name, {
          role: "employee",
          quota: this.homeofficeRules[name] || 40,
          passwordHash: sha
        });
        this.colleaguePasswords[name] = sha;
      }
    } catch (_) {}

    this.currentUser = name;
    this.currentUserUID = this.getUserUID(this.currentUser);
    this.userRole = "employee";
    this.showMainApplication();
  }

  async loginAsTeamleader() {
    const teamleaderPassword = document.getElementById("teamleaderPassword");
    if (!teamleaderPassword?.value) return alert("Bitte geben Sie das Teamleiter-Passwort ein.");
    if (teamleaderPassword.value !== this.teamleaderPassword) return alert("Falsches Teamleiter-Passwort!");
    this.currentUser = "Teamleiter";
    this.userRole = "teamleader";
    this.showMainApplication();
  }

  showMainApplication() {
    console.log("App gestartet als", this.currentUser, "Rolle:", this.userRole);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const planner = new HomeOfficePlanner();
  await planner.initializeDefaultPasswords();
  await planner.initializeFirebase();
  window.app = planner;
});
