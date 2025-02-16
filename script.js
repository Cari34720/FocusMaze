// 🔥 Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔧 Firebase-Konfiguration (Ersetze mit deinen Daten)
const firebaseConfig = {
    apiKey: "DEIN_API_KEY",
    authDomain: "DEIN_AUTH_DOMAIN",
    projectId: "DEIN_PROJECT_ID",
    storageBucket: "DEIN_STORAGE_BUCKET",
    messagingSenderId: "DEINE_MESSAGING_ID",
    appId: "DEINE_APP_ID"
};

// 📌 Firebase initialisieren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🌟 Globale Variablen
let currentUser = null;
let currentRoom = null;
let score = 0;

// 🏠 Login & Registrierung
document.getElementById("login-btn").addEventListener("click", loginUser);
document.getElementById("register-btn").addEventListener("click", registerUser);

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        loadUserData();
        showScreen("game-screen");
    } catch (error) {
        console.error("Login fehlgeschlagen:", error);
        alert("Fehler beim Login! Bitte überprüfe deine Eingaben.");
    }
}

async function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        await saveUserData();
        showScreen("game-screen");
    } catch (error) {
        console.error("Registrierung fehlgeschlagen:", error);
        alert("Fehler bei der Registrierung! Passwort muss mindestens 6 Zeichen haben.");
    }
}

// 🔄 User-Daten laden
async function loadUserData() {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        score = userSnap.data().score;
    } else {
        await saveUserData();
    }
}

// 💾 User-Daten speichern
async function saveUserData() {
    if (!currentUser) return;
    await setDoc(doc(db, "users", currentUser.uid), { score: 0 });
}

// 🎮 Labyrinth-Räume & Fragen
document.querySelectorAll(".room").forEach((room) => {
    room.addEventListener("click", () => {
        currentRoom = room.dataset.room;
        showScreen("question-screen");
        loadQuestion(currentRoom);
    });
});

// ❓ Frage laden
function loadQuestion(room) {
    document.getElementById("question-text").innerText = `Was ist die Antwort für Raum ${room}?`;
}

// ✅ Antwort prüfen
document.getElementById("submit-answer").addEventListener("click", async () => {
    const answer = document.getElementById("answer").value;
    
    if (answer.toLowerCase() === "richtig") {
        score += 10;
        await updateScore();
        alert("Richtig! Weiter geht's!");
        showScreen("game-screen");
    } else {
        alert("Falsch! Versuch es noch einmal.");
    }
});

// 🏆 Punktestand speichern
async function updateScore() {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { score: score });
}

// 🔄 Bildschirm wechseln
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.style.display = "none");
    document.getElementById(screenId).style.display = "block";
}

// 🎭 Dark & Light Mode umschalten
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

// 📢 News automatisch scrollen lassen
setInterval(() => {
    const news = document.getElementById("news-text");
    news.innerText = "🔥 Neues Update: Mehr Fragen verfügbar!";
}, 10000);

// 👤 Prüfen, ob ein Nutzer eingeloggt bleibt
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadUserData();
        showScreen("game-screen");
    } else {
        showScreen("login-screen");
    }
});
