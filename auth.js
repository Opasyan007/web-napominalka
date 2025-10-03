// auth.js — инициализация Firebase + логин/логаут + статус
// Подключай так: <script type="module" src="auth.js?v=6"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Конфиг из Firebase Console → Project settings → Your apps → Web app → Config
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV60o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com", // важно: .appspot.com
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
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");   // <p id="status">Не авторизован</p>
const btnLogin = document.getElementById("btnLogin");
const btnLogout= document.getElementById("btnLogout");

// --- handlers ---
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(
      auth,
      (emailEl?.value || "").trim(),
      passEl?.value || ""
    );
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

// --- статус авторизации ---
onAuthStateChanged(auth, (user) => {
  if (statusEl) {
    statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  }

  // Если хочешь скрывать форму после входа — раскомментируй 2 строки ниже:
  // const authSection = document.getElementById("authSection");
  // if (authSection) authSection.hidden = !!user;
});
