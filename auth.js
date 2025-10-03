+33
-17
Lines changed: 33 additions & 17 deletions
Original file line number	Diff line number	Diff line change
@@ -1,65 +1,81 @@
// auth.js (CDN-версия, без сборщиков)
// auth.js — инициализация Firebase + логин/логаут + статус
// Подключать как <script type="module" src="auth.js?v=6"></script>
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ⚠️ Вставь сюда ТВОЙ актуальный конфиг из консоли (Config/Config/Config),
// а не из npm-вкладки. Поля должны быть ИМЕННО такие.
// ⚠️ Конфиг КОПИРУЕМ ИЗ Firebase → Project settings → Your apps → Web app → Config
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV60o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.firebasestorage.app",
  storageBucket: "sinergia-web-napominalka.appspot.com", // исправлено: .appspot.com
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f41252ac125e8727e67390"
  appId: "1:803232203697:web:f41252ac125e8727e67390",
};
// ---- init + диагностика ----
// --- init ---
console.log("[auth] init start");
const app = initializeApp(firebaseConfig);
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("[auth] firebase init ok");

// ---- DOM ----
// сохраняем сессию между перезагрузками
try {
  await setPersistence(auth, browserLocalPersistence);
  console.log("[auth] persistence: localStorage");
} catch (e) {
  console.error("[auth] setPersistence error:", e);
}
// --- DOM ---
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");
const statusEl = document.getElementById("status");   // <p id="status">Не авторизован</p>
const btnLogin = document.getElementById("btnLogin");
const btnLogout= document.getElementById("btnLogout");

if (!emailEl || !passEl || !statusEl || !btnLogin || !btnLogout) {
  console.error("[auth] Не нашли один из элементов формы");
  console.warn("[auth] проверь id в HTML: #email #password #status #btnLogin #btnLogout");
}

// ---- handlers ----
btnLogin.addEventListener("click", async (e) => {
// --- handlers ---
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    console.log("[auth] login click");
    await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
    alert("Вход выполнен");
    await signInWithEmailAndPassword(auth, (emailEl?.value || "").trim(), passEl?.value || "");
    // alert не нужен — UI переключит script.js; но если хочешь, раскомментируй:
    // alert("Вход выполнен");
  } catch (err) {
    console.error("[auth] login error:", err);
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout.addEventListener("click", async (e) => {
btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    console.log("[auth] logout click");
    await signOut(auth);
    alert("Вы вышли");
    // alert("Вы вышли");
  } catch (err) {
    console.error("[auth] logout error:", err);
    alert(`Ошибка выхода: ${err.code}`);
  }
});

// --- auth state (только ставим текст статуса; скрытие/показ блоков делает script.js) ---
onAuthStateChanged(auth, (user) => {
  statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  if (statusEl) {
    statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  }
  console.log("[auth] state:", user ? user.email : "no user");
});
