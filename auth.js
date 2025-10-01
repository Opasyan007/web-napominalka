document.getElementById("btnLogin").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, emailEl.value, passEl.value);
    alert("Вход выполнен");
  } catch (e) {
    alert(`Ошибка: ${e.code}\n${e.message}`);
    console.error(e);
  }
};
