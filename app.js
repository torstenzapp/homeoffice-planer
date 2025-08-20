// app.js – Logik (Auth + Kalender + Sync)
import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  ref, set, get, update, onValue, child
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ------- UI Helpers -------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const todayYM = () => new Date().toISOString().slice(0,7);
const ymd = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);

// Tabs
const tabs = $$('.tab');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  $('#tab-login').classList.toggle('hidden', t.dataset.tab !== 'login');
  $('#tab-register').classList.toggle('hidden', t.dataset.tab !== 'register');
}));

// Auth Elements
const authView = $('#auth-view');
const appView = $('#app-view');
const nav = $('#nav');
const authMsg = $('#auth-msg');
$('#btn-login').addEventListener('click', async () => {
  authMsg.textContent = '';
  const email = $('#login-email').value.trim();
  const pass = $('#login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    authMsg.textContent = mapAuthError(e);
  }
});

$('#btn-register').addEventListener('click', async () => {
  authMsg.textContent = '';
  const name = $('#reg-name').value.trim();
  const email = $('#reg-email').value.trim();
  const pass = $('#reg-password').value;
  const role = $('#reg-role').value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) await updateProfile(cred.user, { displayName: name });
    // Rolle sicher serverseitig im DB-Profil des Nutzers speichern
    await set(ref(db, `users/${cred.user.uid}/profile`), {
      name: name || '',
      email: email,
      role: role,
      createdAt: Date.now()
    });
  } catch (e) {
    authMsg.textContent = mapAuthError(e);
  }
});

$('#btn-logout').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
    nav.classList.add('hidden');
    return;
  }
  nav.classList.remove('hidden');
  authView.classList.add('hidden');
  appView.classList.remove('hidden');

  // Rolle laden
  const profSnap = await get(ref(db, `users/${user.uid}/profile`));
  let role = 'kollege';
  if (profSnap.exists() && profSnap.val().role) role = profSnap.val().role;
  $('#role-badge').textContent = role === 'teamleiter' ? 'Teamleiter' : 'Kollege';

  // Init Monat
  const mp = $('#month-picker');
  mp.value = todayYM();
  renderCalendar(mp.value);
  await bindMonthData(user.uid, mp.value, role);

  mp.addEventListener('change', async () => {
    renderCalendar(mp.value);
    await bindMonthData(user.uid, mp.value, role);
  });
});

function mapAuthError(e){
  const code = e.code || '';
  const m = {
    'auth/invalid-email': 'Ungültige E-Mail.',
    'auth/user-not-found': 'Nutzer nicht gefunden.',
    'auth/wrong-password': 'Falsches Passwort.',
    'auth/weak-password': 'Passwort ist zu schwach (mind. 6 Zeichen).',
    'auth/email-already-in-use': 'E-Mail bereits registriert.'
  };
  return m[code] || 'Anmeldung fehlgeschlagen.';
}

// ------- Kalender -------
const statusSelect = $('#status-select');
const cal = $('#calendar');
const stats = $('#stats');
let unsubscribeRT = null; // onValue detach

function renderCalendar(ym){
  cal.innerHTML = '';
  const [y,m] = ym.split('-').map(Number);
  const first = new Date(y,m-1,1);
  const last = new Date(y,m,0);
  const daysInMonth = last.getDate();
  // Wochentage: Mo–So
  const head = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  head.forEach(h=>{
    const el = document.createElement('div');
    el.className = 'day';
    el.innerHTML = `<div class="dhead"><strong>${h}</strong></div>`;
    cal.appendChild(el);
  });
  // Leerfelder vor dem 1. (Montag=1, Sonntag=7)
  const offset = (first.getDay() + 6) % 7;
  for (let i=0;i<offset;i++) cal.appendChild(document.createElement('div'));
  for (let d=1; d<=daysInMonth; d++){
    const date = new Date(y,m-1,d);
    const el = document.createElement('div');
    el.className = 'day';
    el.dataset.date = ymd(date);
    el.innerHTML = `<div class="dhead"><span>${d.toString().padStart(2,'0')}</span><span class="badge"></span></div>`;
    el.addEventListener('click', () => applyStatus(el));
    cal.appendChild(el);
  }
}

function applyStatus(dayEl){
  const code = statusSelect.value; // '', HO, BU, KR, UR, A–Z
  const badge = dayEl.querySelector('.badge');
  badge.className = 'badge';
  badge.textContent = '';
  if (code){
    badge.classList.add(code);
    badge.textContent = code;
  }
  statsDirty();
}

function statsDirty(){
  // Zähle Werktage (Mo–Fr) und HO-Anteil
  const dayEls = Array.from(cal.querySelectorAll('.day[data-date]'));
  let workdays = 0, ho = 0;
  dayEls.forEach(el=>{
    const date = new Date(el.dataset.date);
    const wd = date.getDay(); // 0 So … 6 Sa
    const isWorkday = wd>=1 && wd<=5;
    if (isWorkday) {
      workdays++;
      const code = el.querySelector('.badge').textContent;
      if (code === 'HO') ho++;
    }
  });
  const pct = workdays ? Math.round(ho/workdays*100) : 0;
  stats.textContent = `Werktage: ${workdays} – HO-Tage: ${ho} – Quote: ${pct}%`;
}

// ------- Sync (Realtime DB) -------
async function bindMonthData(uid, ym, role){
  // Trenne alten Listener
  if (unsubscribeRT) unsubscribeRT();

  // 1) Laden einmalig
  const monthRef = ref(db, `entries/${uid}/${ym}`);
  const snap = await get(monthRef);
  if (snap.exists()) applyMonthSnapshot(snap.val());
  statsDirty();

  // 2) Live-Updates
  const off = onValue(monthRef, (s) => {
    if (s.exists()) applyMonthSnapshot(s.val());
    statsDirty();
  });
  unsubscribeRT = () => off();

  // 3) Speichern bei Klicks (debounced)
  cal.addEventListener('click', debounce(async ()=>{
    const payload = collectMonthPayload();
    await update(monthRef, payload);
  }, 300));

  // Teamleiter – Teamübersicht laden
  const teamView = $('#team-view');
  teamView.classList.toggle('hidden', role !== 'teamleiter');
  if (role === 'teamleiter') loadTeamOverview(ym);
}

function applyMonthSnapshot(data){
  // data: { 'YYYY-MM-DD': 'HO' | 'BU' | ... }
  const map = data || {};
  $$('#calendar .day[data-date]').forEach(el=>{
    const code = map[el.dataset.date] || '';
    const badge = el.querySelector('.badge');
    badge.className = 'badge';
    badge.textContent = '';
    if (code){
      badge.classList.add(code);
      badge.textContent = code;
    }
  });
}

function collectMonthPayload(){
  const res = {};
  $$('#calendar .day[data-date]').forEach(el=>{
    const code = el.querySelector('.badge').textContent;
    if (code) res[el.dataset.date] = code;
  });
  return res;
}

async function loadTeamOverview(ym){
  const teamList = $('#team-list');
  teamList.innerHTML = '';
  const usersRef = ref(db, 'users');
  const usersSnap = await get(usersRef);
  if (!usersSnap.exists()) return;
  const users = usersSnap.val();
  // Für jeden Nutzer den Monat laden
  const entries = await Promise.all(Object.keys(users).map(async uid => {
    const s = await get(ref(db, `entries/${uid}/${ym}`));
    return { uid, profile: users[uid].profile || {}, data: s.exists()? s.val() : {} };
  }));
  entries.forEach(({uid, profile, data})=>{
    const card = document.createElement('div');
    card.className = 'team-card';
    const hoPct = computeMonthHoPct(data);
    card.innerHTML = `<strong>${profile.name || profile.email || uid}</strong><br/>HO-Quote: ${hoPct}%`;
    teamList.appendChild(card);
  });
}

function computeMonthHoPct(map){
  let workdays=0, ho=0;
  const keys = Object.keys(map||{});
  keys.forEach(k=>{
    const d = new Date(k);
    const wd = d.getDay();
    const isWorkday = wd>=1 && wd<=5;
    if (isWorkday){
      workdays++;
      if (map[k]==='HO') ho++;
    }
  });
  return workdays ? Math.round(ho/workdays*100) : 0;
}

// Export/Import
$('#btn-export').addEventListener('click', () => {
  const ym = $('#month-picker').value;
  const data = collectMonthPayload();
  const blob = new Blob([JSON.stringify({ ym, data }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `homeoffice-${ym}.json`;
  a.click();
});
$('#file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const txt = await file.text();
  const parsed = JSON.parse(txt);
  if (!parsed || !parsed.data || !parsed.ym) return;
  $('#month-picker').value = parsed.ym;
  renderCalendar(parsed.ym);
  applyMonthSnapshot(parsed.data);
  statsDirty();
});

// Utils
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
