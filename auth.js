// auth.js — Firebase Auth, секция авторизации видна всегда; задачи скрывает script.js по событию

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
const authSection = document.getElementById("authSection");
const emailEl     = document.getElementById("email");
const passEl      = document.getElementById("password");
const statusEl    = document.getElementById("status");
const btnLogin    = document.getElementById("btnLogin");
const btnLogout   = document.getElementById("btnLogout");

// показать/спрятать поля входа (секцию не трогаем)
function toggleAuthUI(loggedIn) {
  if (authSection) authSection.style.display = "block";
  if (emailEl)   emailEl.style.display   = loggedIn ? "none" : "";
  if (passEl)    passEl.style.display    = loggedIn ? "none" : "";
  if (btnLogin)  btnLogin.style.display  = loggedIn ? "none" : "";
  if (btnLogout) btnLogout.style.display = ""; // всегда видно
}

// сохраняем сессию между перезагрузками
try { await setPersistence(auth, browserLocalPersistence); } catch (e) { console.error(e); }

// логин/логаут
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, (emailEl?.value || "").trim(), passEl?.value || "");
  } catch (err) {
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try { await signOut(auth); }
  catch (err) { alert(`Ошибка выхода: ${err.code}`); }
});

// --- Состояние авторизации + уведомление для script.js ---
onAuthStateChanged(auth, (user) => {
  const loggedIn = !!user;

  // статусный текст
  if (statusEl) statusEl.textContent = loggedIn ? `Авторизован: ${user.email}` : "Не авторизован";

  // поля входа
  toggleAuthUI(loggedIn);

  // классы на <body> (используются CSS и script.js)
  document.body.classList.toggle('logged-in',  loggedIn);
  document.body.classList.toggle('logged-out', !loggedIn);

  // глобальный флаг + событие, чтобы script.js точно знал состояние
  window.__loggedIn = loggedIn;
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn } }));
});
