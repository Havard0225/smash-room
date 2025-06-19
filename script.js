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
  },
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

  // Tilfeldig plassering
  placeItemRandomly(container);

  // Gi tilfeldig hastighet (retning og fart)
  container.dx = (Math.random() * 2 - 1) * 2; // mellom -2 og 2
  container.dy = (Math.random() * 2 - 1) * 2;

  return container;
}

function placeItemRandomly(item) {
  const maxX = smashArea.clientWidth - item.offsetWidth;
  const maxY = smashArea.clientHeight - item.offsetHeight;

  let isOverlapping;
  let randomX, randomY;

  let tries = 0;
  do {
    tries++;
    if (tries > 100) break;

    randomX = Math.floor(Math.random() * maxX);
    randomY = Math.floor(Math.random() * maxY);

    item.style.left = `${randomX}px`;
    item.style.top = `${randomY}px`;

    isOverlapping = Array.from(smashArea.children).some((otherItem) => {
      if (otherItem === item) return false;
      return isColliding(item, otherItem);
    });
  } while (isOverlapping);
}

function isColliding(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

function smashObject(container, imgWhole, imgBroken, obj) {
  imgWhole.style.display = "none";
  imgBroken.style.display = "block";
  imgBroken.style.animation = "smashAnim 0.6s forwards";

  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 300);

  score += obj.points;
  smashedCount++;
  counter.textContent = score;

  if (smashedCount >= totalObjects) {
    clearInterval(timerInterval);
    nextLevel();
  }
}

function generateObjects(level) {
  smashArea.innerHTML = "";
  smashedCount = 0;
  const count = Math.min(5 + level * 2, 24);
  totalObjects = count;

  for (let i = 0; i < count; i++) {
    const obj = objects[Math.floor(Math.random() * objects.length)];
    createSmashItem(obj);
  }
}

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

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("smashBestScore", bestScore);
    bestScoreText.textContent = bestScore;
  }
}

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

// Animasjonssimulering
function animateItems() {
  const items = Array.from(document.querySelectorAll(".item"));
  const bounds = smashArea.getBoundingClientRect();

  items.forEach(item => {
    let x = item.offsetLeft + item.dx;
    let y = item.offsetTop + item.dy;

    // Sprett fra vegger
    if (x <= 0 || x + item.offsetWidth >= smashArea.clientWidth) {
      item.dx *= -1;
    }
    if (y <= 0 || y + item.offsetHeight >= smashArea.clientHeight) {
      item.dy *= -1;
    }

    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
  });

  // Kollisjoner mellom objekter
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (isColliding(items[i], items[j])) {
        [items[i].dx, items[j].dx] = [items[j].dx, items[i].dx];
        [items[i].dy, items[j].dy] = [items[j].dy, items[i].dy];
      }
    }
  }

  requestAnimationFrame(animateItems);
}

// Start spillet og animasjonen
generateObjects(level);
startTimer();
animateItems();
