// auth.js — Firebase Auth + скрытие/показ блока авторизации

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV60o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com",
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f41252ac125e8727e67390",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM ---
const emailEl     = document.getElementById("email");
const passEl      = document.getElementById("password");
const statusEl    = document.getElementById("status");
const btnLogin    = document.getElementById("btnLogin");
const btnLogout   = document.getElementById("btnLogout");
const authSection = document.getElementById("authSection");

// сохраняем сессию
try { await setPersistence(auth, browserLocalPersistence); } catch(e){ console.error(e); }

// --- обработчики ---
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, (emailEl?.value || "").trim(), passEl?.value || "");
    if (authSection) authSection.style.display = "none"; // сразу прячем
  } catch (err) {
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    if (authSection) authSection.style.display = "block"; // показываем
  } catch (err) {
    alert(`Ошибка выхода: ${err.code}`);
  }
});

// --- синхронизация UI со статусом авторизации ---
onAuthStateChanged(auth, (user) => {
  if (statusEl) {
    statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  }
  if (authSection) {
    authSection.style.display = user ? "none" : "block";
  }
});
