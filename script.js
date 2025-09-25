// Elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const winScreen = document.getElementById("win-screen");
const gameBoard = document.getElementById("game-board");

const movesCounter = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const starsDisplay = document.getElementById("stars");
const finalMoves = document.getElementById("final-moves");
const finalTime = document.getElementById("final-time");
const finalStars = document.getElementById("final-stars");
const leaderboard = document.getElementById("leaderboard");

const restartBtn = document.getElementById("restart-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const diffBtns = document.querySelectorAll(".diff-btn");
const themeBtns = document.querySelectorAll(".theme-btn");
const darkToggle = document.getElementById("dark-toggle");
const musicToggle = document.getElementById("music-toggle");

// Sounds
const flipSound = new Audio("sounds/flip.mp3");
const matchSound = new Audio("sounds/match.mp3");
const winSound = new Audio("sounds/win.mp3");
const bgMusic = new Audio("sounds/bg-music.mp3");
bgMusic.loop = true;

// Game Variables
let moves = 0, flippedCard = null, lockBoard = false, matchedPairs = 0;
let totalPairs = 0, timer = null, time = 0;
let gridSize = 4, theme = "emoji";

// Emoji sets
const sets = {
  emoji: ["🍎","🍌","🍒","🍇","🥝","🍍","🍑","🍉","🍋","🥥","🍓","🥭"],
  animals: ["🐶","🐱","🦊","🐼","🐸","🐵","🐰","🦁","🐷","🐔","🐧","🐨"],
  flags: ["🇺🇸","🇮🇳","🇯🇵","🇫🇷","🇨🇦","🇧🇷","🇩🇪","🇨🇳","🇮🇹","🇷🇺","🇦🇺","🇪🇸"]
};

// Shuffle helper
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

// Timer
function startTimer() {
  timer = setInterval(() => { time++; timerDisplay.textContent = time; }, 1000);
}
function stopTimer() { clearInterval(timer); }

// Reset Stats
function resetStats() {
  moves = 0; time = 0; matchedPairs = 0;
  flippedCard = null; lockBoard = false;
  movesCounter.textContent = moves;
  timerDisplay.textContent = time;
  starsDisplay.textContent = "⭐⭐⭐";
}

// Create Board
function createBoard(size) {
  gameBoard.innerHTML = "";
  gameBoard.className = "game-board";
  if (size === 2) gameBoard.classList.add("small");
  else if (size === 4) gameBoard.classList.add("medium");
  else gameBoard.classList.add("large");

  totalPairs = (size * size) / 2;
  let chosen = shuffle([...sets[theme]]).slice(0, totalPairs);
  let cards = shuffle([...chosen, ...chosen]);

  cards.forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${symbol}</div>
      </div>`;
    gameBoard.appendChild(card);
    card.addEventListener("click", () => flipCard(card, symbol));
  });
}

// Flip
function flipCard(card, symbol) {
  if (lockBoard || card.classList.contains("flip")) return;
  flipSound.play();
  card.classList.add("flip");

  if (!flippedCard) {
    flippedCard = { card, symbol };
  } else {
    moves++; movesCounter.textContent = moves; updateStars();
    if (flippedCard.symbol === symbol) {
      matchedPairs++; matchSound.play();
      flippedCard = null;
      if (matchedPairs === totalPairs) setTimeout(showWin, 600);
    } else {
      lockBoard = true;
      setTimeout(() => {
        card.classList.remove("flip");
        flippedCard.card.classList.remove("flip");
        flippedCard = null; lockBoard = false;
      }, 1000);
    }
  }
}

// Stars
function updateStars() {
  if (moves > totalPairs * 3) starsDisplay.textContent = "⭐";
  else if (moves > totalPairs * 2) starsDisplay.textContent = "⭐⭐";
  else starsDisplay.textContent = "⭐⭐⭐";
}

// Win
function showWin() {
  stopTimer(); winSound.play(); launchConfetti();
  gameScreen.classList.add("hidden");
  winScreen.classList.remove("hidden");
  finalMoves.textContent = moves;
  finalTime.textContent = time;
  finalStars.textContent = starsDisplay.textContent;
  saveScore(time, moves, starsDisplay.textContent);
  renderLeaderboard();
}

// Leaderboard
function saveScore(time, moves, stars) {
  let scores = JSON.parse(localStorage.getItem("memory-scores")) || [];
  scores.push({ time, moves, stars });
  scores.sort((a,b) => a.time - b.time);
  localStorage.setItem("memory-scores", JSON.stringify(scores.slice(0,5)));
}
function renderLeaderboard() {
  leaderboard.innerHTML = "";
  let scores = JSON.parse(localStorage.getItem("memory-scores")) || [];
  scores.forEach(s => {
    let li = document.createElement("li");
    li.textContent = `⏱️ ${s.time}s | 🎯 ${s.moves} moves | ${s.stars}`;
    leaderboard.appendChild(li);
  });
}

// Confetti
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 8 + 2,
    color: `hsl(${Math.random()*360},100%,50%)`,
    speed: Math.random() * 3 + 2
  }));
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y += p.speed;
      if (p.y > canvas.height) p.y = -10;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// Difficulty
diffBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    gridSize = parseInt(btn.dataset.size);
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resetStats(); createBoard(gridSize); startTimer();
    if (!bgMusic.paused) bgMusic.play();
  });
});

// Theme
themeBtns.forEach(btn => {
  btn.addEventListener("click", () => { theme = btn.dataset.theme; });
});

// Dark Mode
darkToggle.addEventListener("click", () => { document.body.classList.toggle("dark"); });

// Music Toggle
musicToggle.addEventListener("click", () => {
  if (bgMusic.paused) bgMusic.play(); else bgMusic.pause();
});

// Restart
restartBtn.addEventListener("click", () => {
  resetStats(); createBoard(gridSize); stopTimer(); startTimer();
});

// Play Again
playAgainBtn.addEventListener("click", () => {
  winScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  document.getElementById("confetti-canvas").getContext("2d").clearRect(0,0,window.innerWidth,window.innerHeight);
});
