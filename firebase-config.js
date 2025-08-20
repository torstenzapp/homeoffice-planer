// firebase-config.sample.js
// 👉 Kopieren, Werte einsetzen, als firebase-config.js speichern

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

export const firebaseConfig = {
  apiKey: "AIzaSyDdLYCXvtuXPUhehE-QfqaXWRfseGfwzf4",
  authDomain: "homeoffice-planer-drv.firebaseapp.com",
  databaseURL: "https://homeoffice-planer-drv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "homeoffice-planer-drv",
  storageBucket: "homeoffice-planer-drv.firebasestorage.app",
  messagingSenderId: "669565818222",
  appId: "1:669565818222:web:9eb342704c1a74c5eedd7f"
}; 

export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);


