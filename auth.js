// auth.js — Firebase init + логин/логаут + переключение экранов

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* ⚠️ Конфиг: из Firebase → Project settings → Your apps → Web app → Config */
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV60o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com",
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f41252ac125e8727e67390",
};

// --- init ---
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// сохраняем сессию между перезагрузками
try {
  await setPersistence(auth, browserLocalPersistence);
} catch (e) {
  console.error("[auth] setPersistence error:", e);
}

// --- DOM ---
const emailEl    = document.getElementById("email");
const passEl     = document.getElementById("password");
const statusEl   = document.getElementById("status");
const btnLogin   = document.getElementById("btnLogin");
const btnLogout  = document.getElementById("btnLogout");
const authSection= document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const fabBtn     = document.getElementById("fab");

// чтобы script.js мог знать, авторизован ли юзер
window.currentUser = null;

// --- handlers ---
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(
      auth,
      (emailEl?.value || "").trim(),
      passEl?.value || ""
    );
    // небольшой UX: фокус на поле названия задачи
    setTimeout(() => document.getElementById("taskTitle")?.focus(), 0);
  } catch (err) {
    console.error("[auth] login error:", err);
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
  } catch (err) {
    console.error("[auth] logout error:", err);
    alert(`Ошибка выхода: ${err.code}`);
  }
});

// --- состояние авторизации: переключаем экраны ---
onAuthStateChanged(auth, (user) => {
  window.currentUser = user || null;

  if (statusEl) {
    statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  }

  if (user) {
    // показать менеджер задач
    if (authSection) authSection.style.display = "none";
    if (appSection)  appSection.style.display  = "block";
    if (fabBtn)      fabBtn.style.display      = "inline-flex";
    if (passEl)      passEl.value = "";
  } else {
    // показать авторизацию
    if (authSection) authSection.style.display = "block";
    if (appSection)  appSection.style.display  = "none";
    if (fabBtn)      fabBtn.style.display      = "none";
  }
});
