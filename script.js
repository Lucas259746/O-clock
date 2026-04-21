// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then((registration) => {
    console.log('Service Worker enregistré:', registration);
  }).catch((error) => {
    console.log('Erreur Service Worker:', error);
  });
}

// ===== TIMER =====
let timerSeconds = 0;
let timerInterval = null;

function switchTab(tabName) {
  const contents = document.querySelectorAll(".tab-content");
  const buttons = document.querySelectorAll(".tab-button");

  contents.forEach((content) => content.classList.remove("active"));
  buttons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  document.getElementById("timerDisplay").textContent =
    formatTime(timerSeconds);
}

function incrementTimer() {
  timerSeconds += 60;
  updateTimerDisplay();
}

function decrementTimer() {
  if (timerSeconds >= 60) {
    timerSeconds -= 60;
    updateTimerDisplay();
  }
}

function setTimerFromInput() {
  const input = document.getElementById("timerInput");
  const minutes = parseInt(input.value) || 0;
  timerSeconds = minutes * 60;
  updateTimerDisplay();
  input.value = "";
}

function toggleTimer() {
  const btn = document.getElementById("timerStartBtn");
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = "▶️ Démarrer";
  } else {
    if (timerSeconds <= 0) {
      alert("Veuillez définir un temps!");
      return;
    }
    btn.textContent = "⏸️ Arrêter";
    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.textContent = "▶️ Démarrer";
        showTimerAlert();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  updateTimerDisplay();
  document.getElementById("timerStartBtn").textContent = "▶️ Démarrer";
  document.getElementById("timerAlert").classList.remove("show");
}

function showTimerAlert() {
  const alertBox = document.getElementById("timerAlert");
  alertBox.classList.add("show");
  setTimeout(() => alertBox.classList.remove("show"), 5000);
}

// ===== STOPWATCH =====
let stopwatchSeconds = 0;
let stopwatchInterval = null;

function updateStopwatchDisplay() {
  document.getElementById("stopwatchDisplay").textContent =
    formatTime(stopwatchSeconds);
}

function toggleStopwatch() {
  const btn = document.getElementById("stopwatchStartBtn");
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    btn.textContent = "▶️ Démarrer";
  } else {
    btn.textContent = "⏸️ Arrêter";
    stopwatchInterval = setInterval(() => {
      stopwatchSeconds++;
      updateStopwatchDisplay();
    }, 1000);
  }
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
  stopwatchSeconds = 0;
  updateStopwatchDisplay();
  document.getElementById("stopwatchStartBtn").textContent =
    "▶️ Démarrer";
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const franceTz = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );

  const hours = franceTz.getHours();
  const minutes = franceTz.getMinutes();
  const seconds = franceTz.getSeconds();

  document.getElementById("digitalClock").textContent = formatTime(
    hours * 3600 + minutes * 60 + seconds,
  );

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = (minutes / 60) * 360 + (seconds / 3600) * 360;
  const hourDeg = ((hours % 12) / 12) * 360 + (minutes / 720) * 360;

  document.getElementById("secondHand").style.transform =
    `rotate(${secondDeg}deg)`;
  document.getElementById("minuteHand").style.transform =
    `rotate(${minuteDeg}deg)`;
  document.getElementById("hourHand").style.transform =
    `rotate(${hourDeg}deg)`;
}

setInterval(updateClock, 1000);
updateClock();

// ===== ALARM =====
let alarms = [];

// Charger les alarmes depuis localStorage au démarrage
function loadAlarms() {
  const saved = localStorage.getItem('alarms');
  if (saved) {
    try {
      alarms = JSON.parse(saved);
      updateAlarmList();
    } catch (e) {
      console.log('Erreur lors du chargement des alarmes:', e);
      alarms = [];
    }
  }
}

// Sauvegarder les alarmes dans localStorage
function saveAlarms() {
  localStorage.setItem('alarms', JSON.stringify(alarms));
}

function addAlarm() {
  const timeInput = document.getElementById("alarmTime").value;
  const messageInput = document.getElementById("alarmMessage").value;

  if (!timeInput || !messageInput) {
    alert("Veuillez remplir tous les champs!");
    return;
  }

  alarms.push({
    id: Date.now(),
    time: timeInput,
    message: messageInput,
  });

  saveAlarms();
  document.getElementById("alarmTime").value = "";
  document.getElementById("alarmMessage").value = "";
  updateAlarmList();
}

function updateAlarmList() {
  const alarmItems = document.getElementById("alarmItems");
  alarmItems.innerHTML = "";

  const now = new Date();
  const franceTz = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );
  const currentTime = `${String(franceTz.getHours()).padStart(2, "0")}:${String(franceTz.getMinutes()).padStart(2, "0")}`;

  alarms.forEach((alarm) => {
    const alarmDiv = document.createElement("div");
    alarmDiv.className = "alarm-item";

    const isPassed = alarm.time <= currentTime;
    const statusClass = isPassed ? "passed" : "upcoming";
    const statusText = isPassed
      ? "Passée"
      : `Dans ${calculateTimeUntil(alarm.time)}`;

    alarmDiv.innerHTML = `
                <div>
                    <span class="alarm-time">${alarm.time}</span> - ${alarm.message}
                    <div class="alarm-status ${statusClass}">${statusText}</div>
                </div>
                <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">Supprimer</button>
            `;
    alarmItems.appendChild(alarmDiv);
  });
}

function calculateTimeUntil(alarmTime) {
  const [alarmHour, alarmMinute] = alarmTime.split(":");
  const now = new Date();
  const franceTz = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );

  let alarmDate = new Date(franceTz);
  alarmDate.setHours(parseInt(alarmHour));
  alarmDate.setMinutes(parseInt(alarmMinute));
  alarmDate.setSeconds(0);

  if (alarmDate <= franceTz) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }

  const diffMs = alarmDate - franceTz;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function deleteAlarm(id) {
  alarms = alarms.filter((alarm) => alarm.id !== id);
  saveAlarms();
  updateAlarmList();
}

function checkAlarms() {
  const now = new Date();
  const franceTz = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );
  const currentTime = `${String(franceTz.getHours()).padStart(2, "0")}:${String(franceTz.getMinutes()).padStart(2, "0")}`;
  const currentSecond = franceTz.getSeconds();

  alarms.forEach((alarm) => {
    if (alarm.time === currentTime && currentSecond === 0) {
      showAlarmAlert(alarm.message);
    }
  });
}

function showAlarmAlert(message) {
  document.getElementById("alarmAlertMessage").textContent = message;
  const alertBox = document.getElementById("alarmAlert");
  alertBox.classList.add("show");
  setTimeout(() => alertBox.classList.remove("show"), 5000);
}

setInterval(() => {
  updateAlarmList();
  checkAlarms();
}, 1000);

// Charger les alarmes sauvegardées au démarrage
loadAlarms();
