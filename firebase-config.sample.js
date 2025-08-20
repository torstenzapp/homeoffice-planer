// firebase-config.sample.js
// 👉 Kopieren, Werte einsetzen, als firebase-config.js speichern

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

export const firebaseApp = initializeApp({
  apiKey: "__API_KEY__",
  authDomain: "__AUTH_DOMAIN__",
  databaseURL: "__DATABASE_URL__",
  projectId: "__PROJECT_ID__",
  storageBucket: "__STORAGE_BUCKET__",
  messagingSenderId: "__MSG_SENDER_ID__",
  appId: "__APP_ID__"
});

export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);
