// auth.js
// Подключать так: <script type="module" src="auth.js?v=11"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ⚠️ ВСТАВЬ СВОЙ КОНФИГ 1-в-1 из Firebase Console → Project settings → Your apps → Web app → Config
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV6o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com",
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f41252ac125e8727e67390",
};

// --- DOM ---
const authSection = document.getElementById("authSection");
const appSection  = document.getElementById("appSection");
const emailEl     = document.getElementById("email");
const passEl      = document.getElementById("password");
const statusEl    = document.getElementById("status");
const btnLogin    = document.getElementById("btnLogin");
const btnLogout   = document.getElementById("btnLogout");

// Утилита: показать приложение / скрыть авторизацию
function showAppUI(isAuthed) {
  if (!authSection || !appSection) return;
  authSection.style.display = isAuthed ? "none"  : "block";
  appSection.style.display  = isAuthed ? "block" : "none";
}

// --- init ---
console.log("[auth] init…");
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// помним сессию между перезагрузками
try {
  await setPersistence(auth, browserLocalPersistence);
  console.log("[auth] persistence: local");
} catch (e) {
  console.error("[auth] setPersistence error:", e);
}

// --- handlers ---
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const email = (emailEl?.value || "").trim();
    const pass  = (passEl?.value || "");
    if (!email || !pass) return alert("Введите email и пароль");
    await signInWithEmailAndPassword(auth, email, pass);
    // UI переключится в onAuthStateChanged
  } catch (err) {
    console.error("[auth] login error:", err);
    alert(`Ошибка входа:\n${err.code}\n${err.message}`);
  }
});

btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
  } catch (err) {
    console.error("[auth] logout error:", err);
    alert(`Ошибка выхода:\n${err.code}`);
  }
});

// --- auth state ---
onAuthStateChanged(auth, (user) => {
  const isAuthed = !!user;
  statusEl && (statusEl.textContent = isAuthed ? `Авторизован: ${user.email}` : "Не авторизован");
  showAppUI(isAuthed);
  console.log("[auth] state:", isAuthed ? user.email : "no user");
});

// На всякий случай: при первой загрузке показать форму логина
showAppUI(false);
