// auth.js — Firebase Auth, секция всегда видна; прячем только поля/кнопку "Войти"

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

// полезная утилита: показать/спрятать элементы входа, но секцию не трогаем
function toggleAuthUI(loggedIn) {
  // секция всегда видна
  if (authSection) authSection.style.display = "block";
  // поля/кнопка "Войти"
  if (emailEl)   emailEl.style.display   = loggedIn ? "none" : "";
  if (passEl)    passEl.style.display    = loggedIn ? "none" : "";
  if (btnLogin)  btnLogin.style.display  = loggedIn ? "none" : "";
  // кнопка "Выйти" всегда доступна
  if (btnLogout) btnLogout.style.display = "";
}

// сохраняем сессию
try { await setPersistence(auth, browserLocalPersistence); } catch(e){ console.error(e); }

// обработчики
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, (emailEl?.value || "").trim(), passEl?.value || "");
    // после успешного входа: скрываем поля/кнопку "Войти"
    toggleAuthUI(true);
  } catch (err) {
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    // после выхода: показываем поля/кнопку "Войти"
    toggleAuthUI(false);
  } catch (err) {
    alert(`Ошибка выхода: ${err.code}`);
  }
});

// синхронизация UI при любых изменениях состояния
onAuthStateChanged(auth, (user) => {
  if (statusEl) statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  toggleAuthUI(!!user);
});
