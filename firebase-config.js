// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
