// auth.js ОДНА версия, без дублей и экспортов
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ТВОЙ конфиг из Firebase Console → Project settings → General → Config
const firebaseConfig = {
  apiKey: "AIzaSyDh2g8c-3QTetKH6zV6o2PS4t8ctZLXow",
  authDomain: "sinergia-web-napominalka.firebaseapp.com",
  projectId: "sinergia-web-napominalka",
  storageBucket: "sinergia-web-napominalka.appspot.com",
  messagingSenderId: "803232203697",
  appId: "1:803232203697:web:f4125ac125e8727e67390"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Элементы
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");

// Логин
document.getElementById("btnLogin").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, emailEl.value, passEl.value);
    alert("Вход выполнен");
  } catch (e) {
    alert("Ошибка: " + e.message);
  }
};

// Выход
document.getElementById("btnLogout").onclick = async () => {
  await signOut(auth);
  alert("Вы вышли");
};

// Отслеживание состояния
onAuthStateChanged(auth, (user) => {
  statusEl.textContent = user ? `Авторизован: ${user.email}` : "Не авторизован";
  // Если нужно, сделаем auth доступным другим скриптам:
  window.firebaseAuth = auth;
});

