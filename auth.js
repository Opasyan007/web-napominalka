// auth.js (CDN-версия, без сборщиков)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ⚠️ Вставь сюда ТВОЙ актуальный конфиг из консоли (Config/Config/Config),
// а не из npm-вкладки. Поля должны быть ИМЕННО такие.
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV6o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com",
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f4125ac125e8727e67390",
};

// ---- init + диагностика ----
console.log("[auth] init start");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("[auth] firebase init ok");

// ---- DOM ----
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");
const btnLogin = document.getElementById("btnLogin");
const btnLogout= document.getElementById("btnLogout");

if (!emailEl || !passEl || !statusEl || !btnLogin || !btnLogout) {
  console.error("[auth] Не нашли один из элементов формы");
}

// ---- handlers ----
btnLogin.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    console.log("[auth] login click");
    await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
    alert("Вход выполнен");
  } catch (err) {
    console.error("[auth] login error:", err);
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    console.log("[auth] logout click");
    await signOut(auth);
    alert("Вы вышли");
  } catch (err) {
    console.error("[auth] logout error:", err);
    alert(`Ошибка выхода: ${err.code}`);
  }
});

onAuthStateChanged(auth, (user) => {
  statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  console.log("[auth] state:", user ? user.email : "no user");
});
