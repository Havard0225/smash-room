const objects = [
  {
    name: "glass",
    whole: "./img/glass.jpg",
    broken: "./img/broken-glass.jpg",
    soundId: "sound-glass",
    points: 1,
  },
  {
    name: "vase",
    whole: "./img/vase.jpg",
    broken: "./img/broken-vase.jpg",
    soundId: "sound-vase",
    points: 3,
  },
  {
    name: "plate",
    whole: "./img/plate.jpg",
    broken: "./img/broken-plate.jpg",
    soundId: "sound-plate",
    points: 2,
  },
  {
    name: "cup",
    whole: "./img/cup.jpg",
    broken: "./img/broken-cup.jpg",
    soundId: "sound-glass",
    points: 1,
  },
  {
    name: "bottle",
    whole: "./img/glass-botle.jpg",
    broken: "./img/broken-glass-botle.jpg",
    soundId: "sound-vase",
    points: 4,
  }
];

const smashArea = document.getElementById("smash-area");
const counter = document.getElementById("count");
const levelText = document.getElementById("current-level");
const timerText = document.getElementById("time-left");
const bestScoreText = document.getElementById("best-score");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

let score = 0;
let level = 1;
let timeLeft = 30;
let timerInterval;
let smashedCount = 0;
let totalObjects = 0;

// Last beste score fra localStorage
let bestScore = localStorage.getItem("smashBestScore") || 0;
bestScoreText.textContent = bestScore;

function createSmashItem(obj) {
  const container = document.createElement("div");
  container.className = "item";

  const imgWhole = document.createElement("img");
  imgWhole.src = obj.whole;
  imgWhole.alt = obj.name;

  const imgBroken = document.createElement("img");
  imgBroken.src = obj.broken;
  imgBroken.className = "broken";
  imgBroken.alt = `broken-${obj.name}`;
  imgBroken.style.display = "none";

  container.appendChild(imgWhole);
  container.appendChild(imgBroken);

  container.addEventListener("click", () => {
    if (imgWhole.style.display !== "none" && timeLeft > 0) {
      smashObject(container, imgWhole, imgBroken, obj);
    }
  });

  smashArea.appendChild(container);
  return container;
}

function smashObject(container, imgWhole, imgBroken, obj) {
  // Spill lyd
  const sound = document.getElementById(obj.soundId);
  if(sound) {
    sound.currentTime = 0;
    sound.play();
  }

  // Bytt bilde til knust
  imgWhole.style.display = "none";
  imgBroken.style.display = "block";

  // Legg på smash animasjon på det knuste bildet
  imgBroken.style.animation = "smashAnim 0.6s forwards";

  // Rist skjermen litt
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 300);

  // Oppdater score og teller
  score += obj.points;
  smashedCount++;
  counter.textContent = score;

  // Hvis alle objekter er knust, gå til neste nivå
  if (smashedCount >= totalObjects) {
    clearInterval(timerInterval);
    nextLevel();
  }
}

// Generer objekter til nivå
function generateObjects(level) {
  smashArea.innerHTML = "";
  smashedCount = 0;

  // Antall objekter øker med nivå, mellom 5 og 24
  const count = Math.min(5 + level * 2, 24);
  totalObjects = count;

  for (let i = 0; i < count; i++) {
    // Velg tilfeldig objekt
    const obj = objects[Math.floor(Math.random() * objects.length)];
    createSmashItem(obj);
  }
}

// Timer funksjon
function startTimer() {
  timeLeft = 10;
  timerText.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

// Neste nivå
function nextLevel() {
  message.textContent = `Bra jobbet! Går til nivå ${level + 1}`;
  level++;
  levelText.textContent = level;
  saveBestScore();
  setTimeout(() => {
    message.textContent = "";
    generateObjects(level);
    startTimer();
  }, 2000);
}

// Lagre highscore i localStorage
function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("smashBestScore", bestScore);
    bestScoreText.textContent = bestScore;
  }
}

// Avslutt spill
function endGame() {
  saveBestScore();
  message.textContent = `Tid ute! Du fikk ${score} poeng.`;
  restartBtn.style.display = "inline-block";
  smashArea.querySelectorAll(".item img").forEach(img => {
    img.style.pointerEvents = "none";
  });
}

restartBtn.addEventListener("click", () => {
  score = 0;
  level = 1;
  counter.textContent = score;
  levelText.textContent = level;
  message.textContent = "";
  restartBtn.style.display = "none";
  generateObjects(level);
  startTimer();
});

// Start spillet
generateObjects(level);
startTimer();
