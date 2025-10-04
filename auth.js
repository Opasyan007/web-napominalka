// auth.js (type="module")
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

// ——— DOM
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");
const btnLogin = document.getElementById("btnLogin");
const btnLogout= document.getElementById("btnLogout");

// ——— Показ/скрытие полей логина (чтобы не было ошибки — определяем функцию)
function toggleAuthUI(loggedIn) {
  // сам блок авторизации пусть всегда виден
  if (emailEl)  emailEl.style.display  = loggedIn ? "none" : "";
  if (passEl)   passEl.style.display   = loggedIn ? "none" : "";
  if (btnLogin) btnLogin.style.display = loggedIn ? "none" : "";
  if (btnLogout)btnLogout.style.display= "";           // показываем всегда
}

try {
  await setPersistence(auth, browserLocalPersistence);
} catch (e) {
  console.error("[auth] setPersistence error:", e);
}

// ——— Логин/логаут
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(
      auth,
      (emailEl?.value || "").trim(),
      passEl?.value || ""
    );
  } catch (err) {
    alert(`Ошибка: ${err.code}\n${err.message}`);
  }
});

btnLogout?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
  } catch (err) {
    alert(`Ошибка выхода: ${err.code}`);
  }
});

// ——— Основной наблюдатель
onAuthStateChanged(auth, (user) => {
  const loggedIn = !!user;

  // статус
  if (statusEl) {
    statusEl.textContent = loggedIn ? `Авторизован: ${user.email}` : "Не авторизован";
  }

  // поля входа
  try { toggleAuthUI(loggedIn); } catch(e) { console.warn("toggleAuthUI error:", e); }

  // ключевые метки для остального приложения
  document.body.classList.toggle("logged-in",  loggedIn);
  document.body.classList.toggle("logged-out", !loggedIn);
  window.__loggedIn = loggedIn;

  // уведомим другие скрипты (script.js)
  window.dispatchEvent(new CustomEvent("auth-changed", { detail: { loggedIn } }));
});
