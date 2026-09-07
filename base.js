document.getElementById("app-base").href = location.pathname.startsWith("/how-i-hear-music/") ? "/how-i-hear-music/" : "/";
try {
  const savedTheme = localStorage.getItem("how-i-hear-music:theme:v1");
  document.documentElement.dataset.theme = savedTheme === "chromatic" ? "chromatic" : "paper";
} catch {
  document.documentElement.dataset.theme = "paper";
}
