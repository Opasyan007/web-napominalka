// auth.js — полная версия
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// === ТВОЙ конфиг из Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV6o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com",
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f4125ac125e8727e67390",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.firebaseAuth = auth; // если понадобится в других скриптах

// Ссылки на элементы
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");

// Вход
document.getElementById("btnLogin").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, (emailEl.value || "").trim(), passEl.value || "");
    alert("Вход выполнен");
  } catch (err) {
    alert(`Ошибка: ${err.code}\n${err.message}`);
    console.error("LOGIN ERROR:", err);
  }
});

// Выход
document.getElementById("btnLogout").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    alert("Вы вышли");
  } catch (err) {
    alert(`Ошибка выхода: ${err.code}`);
    console.error("LOGOUT ERROR:", err);
  }
});

// Отслеживание статуса
onAuthStateChanged(auth, (user) => {
  statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
});
