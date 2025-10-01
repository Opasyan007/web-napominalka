document.getElementById("btnLogin").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
    alert("Вход выполнен");
  } catch (e) {
    alert(`Ошибка: ${e.code}\n${e.message}`);
    console.error(e);
  }
});

document.getElementById("btnLogout").addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  alert("Вы вышли");
});
