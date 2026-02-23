/* =====================================================
   BoltType — app.js
   Vanilla JS typing engine: highlight, timer, WPM,
   accuracy, high score (localStorage), service worker
   ===================================================== */

'use strict';

// ─── Register Service Worker ─────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

// ─── Word Bank ────────────────────────────────────────
const WORD_BANK = [
  'the','be','to','of','and','a','in','that','have','it',
  'for','not','on','with','he','as','you','do','at','this',
  'but','his','by','from','they','we','say','her','she','or',
  'an','will','my','one','all','would','there','their','what',
  'so','up','out','if','about','who','get','which','go','me',
  'when','make','can','like','time','no','just','him','know',
  'take','people','into','year','your','good','some','could',
  'them','see','other','than','then','now','look','only','come',
  'its','over','think','also','back','after','use','two','how',
  'our','work','first','well','way','even','new','want','because',
  'any','these','give','day','most','us','great','between','need',
  'large','often','hand','high','place','hold','free','real','life',
  'few','north','open','seem','together','next','white','children',
  'begin','got','walk','example','ease','paper','group','always',
  'music','those','both','mark','book','letter','until','mile',
  'river','car','feet','care','second','enough','plain','girl',
  'usual','young','ready','above','ever','red','list','though',
  'feel','talk','bird','soon','body','dog','family','direct',
  'pose','leave','song','measure','door','product','black',
  'short','numeral','class','wind','question','happen','complete'
];

// ─── DOM References ───────────────────────────────────
const timerDisplay    = document.getElementById('timer-display');
const wpmDisplay      = document.getElementById('wpm-display');
const highscoreDisplay= document.getElementById('highscore-display');
const textDisplay     = document.getElementById('text-display');
const hiddenInput     = document.getElementById('hidden-input');
const startBtn        = document.getElementById('start-btn');
const resetBtn        = document.getElementById('reset-btn');
const idleScreen      = document.getElementById('idle-screen');
const accuracyWrap    = document.getElementById('accuracy-wrap');
const accuracyBar     = document.getElementById('accuracy-bar');
const accuracyLabel   = document.getElementById('accuracy-label');
const modeBadge       = document.getElementById('mode-badge');
const resultsOverlay  = document.getElementById('results-overlay');
const resultWpm       = document.getElementById('result-wpm');
const resultAcc       = document.getElementById('result-acc');
const resultChars     = document.getElementById('result-chars');
const newBest         = document.getElementById('new-best');
const playAgainBtn    = document.getElementById('play-again-btn');

// ─── State ─────────────────────────────────────────────
const GAME_DURATION = 60; // seconds

let words         = [];
let wordSpans     = [];   // flat array of {span, char}
let currentIndex  = 0;    // char index across all chars
let correctCount  = 0;
let wrongCount    = 0;
let totalTyped    = 0;
let timerInterval = null;
let timeLeft      = GAME_DURATION;
let gameActive    = false;
let gameStarted   = false;
let highScore     = 0;

// ─── High Score ────────────────────────────────────────
function loadHighScore() {
  const saved = localStorage.getItem('bolttype_highscore');
  highScore = saved ? parseInt(saved, 10) : 0;
  highscoreDisplay.textContent = highScore;
}

function saveHighScore(score) {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('bolttype_highscore', highScore);
    highscoreDisplay.textContent = highScore;
    return true;
  }
  return false;
}

// ─── Word / Text Generation ────────────────────────────
function generateWords(count = 80) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
  }
  return arr;
}

function buildTextDisplay() {
  textDisplay.innerHTML = '';
  wordSpans = [];

  words.forEach((word, wi) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';

    // Each character gets its own span
    [...word].forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      wordEl.appendChild(span);
      wordSpans.push({ span, char });
    });

    // Space after word (except last)
    if (wi < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.textContent = ' ';
      wordEl.appendChild(spaceSpan);
      wordSpans.push({ span: spaceSpan, char: ' ' });
    }

    textDisplay.appendChild(wordEl);
  });

  // Mark first char as cursor
  if (wordSpans.length > 0) {
    wordSpans[0].span.classList.add('cursor');
  }
}

// ─── Timer ─────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    // Flash timer red when low
    if (timeLeft <= 10) {
      timerDisplay.style.color = 'var(--wrong)';
    }
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ─── WPM Calculation ───────────────────────────────────
function calcWPM() {
  const minutesElapsed = (GAME_DURATION - timeLeft) / 60;
  if (minutesElapsed === 0) return 0;
  // Standard: 5 chars = 1 word
  return Math.round((correctCount / 5) / minutesElapsed);
}

function calcAccuracy() {
  if (totalTyped === 0) return 100;
  return Math.round((correctCount / totalTyped) * 100);
}

// ─── Game Flow ─────────────────────────────────────────
function initGame() {
  // Reset state
  clearInterval(timerInterval);
  currentIndex  = 0;
  correctCount  = 0;
  wrongCount    = 0;
  totalTyped    = 0;
  timeLeft      = GAME_DURATION;
  gameActive    = false;
  gameStarted   = false;

  timerDisplay.textContent = GAME_DURATION;
  timerDisplay.style.color = '';
  wpmDisplay.textContent   = '0';

  words = generateWords(80);
  buildTextDisplay();

  // Show typing UI
  idleScreen.style.display    = 'none';
  textDisplay.style.display   = 'block';
  accuracyWrap.style.display  = 'flex';
  accuracyBar.style.width     = '100%';
  accuracyLabel.textContent   = '100%';

  resultsOverlay.style.display = 'none';
  startBtn.style.display       = 'none';
  resetBtn.style.display       = 'inline-flex';

  modeBadge.textContent = 'TYPE!';
  modeBadge.className   = 'badge active';

  // Focus hidden input
  hiddenInput.value = '';
  hiddenInput.focus();
  gameActive = true;
}

function endGame() {
  clearInterval(timerInterval);
  gameActive = false;

  hiddenInput.blur();

  const finalWPM = calcWPM();
  const finalAcc = calcAccuracy();
  const isNew    = saveHighScore(finalWPM);

  // Populate results
  resultWpm.textContent   = finalWPM;
  resultAcc.textContent   = finalAcc + '%';
  resultChars.textContent = correctCount;
  newBest.style.display   = isNew ? 'block' : 'none';

  modeBadge.textContent = 'DONE';
  modeBadge.className   = 'badge done';

  // Show overlay
  resultsOverlay.style.display = 'flex';
}

function resetGame() {
  clearInterval(timerInterval);
  gameActive   = false;

  hiddenInput.value = '';
  startBtn.style.display = 'block';
  resetBtn.style.display = 'none';
  idleScreen.style.display = 'flex';
  textDisplay.style.display = 'none';
  accuracyWrap.style.display = 'none';
  resultsOverlay.style.display = 'none';
  timerDisplay.textContent = GAME_DURATION;
  timerDisplay.style.color = '';
  wpmDisplay.textContent   = '0';
  modeBadge.textContent    = 'READY';
  modeBadge.className      = 'badge';
}

// ─── Input Handling ────────────────────────────────────
hiddenInput.addEventListener('input', (e) => {
  if (!gameActive) return;

  // Start timer on first keypress
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  const typed = hiddenInput.value;

  // We only care about the last character typed
  if (typed.length === 0) return;

  const typedChar = typed[typed.length - 1];
  hiddenInput.value = ''; // clear for next keystroke

  if (currentIndex >= wordSpans.length) return;

  const { span, char } = wordSpans[currentIndex];

  // Remove cursor from current
  span.classList.remove('cursor');

  totalTyped++;

  if (typedChar === char) {
    span.classList.add('correct');
    correctCount++;
  } else {
    span.classList.add('wrong');
    wrongCount++;
  }

  currentIndex++;

  // Set cursor to next
  if (currentIndex < wordSpans.length) {
    wordSpans[currentIndex].span.classList.add('cursor');
    scrollToCursor();
  } else {
    // All words done — regenerate
    words = generateWords(80);
    buildTextDisplay();
    currentIndex = 0;
  }

  // Update live WPM
  wpmDisplay.textContent = calcWPM();

  // Update accuracy bar
  const acc = calcAccuracy();
  accuracyBar.style.width   = acc + '%';
  accuracyLabel.textContent = acc + '%';
  if (acc < 70) {
    accuracyBar.style.background = 'linear-gradient(90deg, var(--wrong), #ff8a00)';
  } else {
    accuracyBar.style.background = 'linear-gradient(90deg, var(--cyan), var(--violet))';
  }
});

// Handle backspace via keydown (input event doesn't fire for backspace on empty field)
hiddenInput.addEventListener('keydown', (e) => {
  if (!gameActive) return;
  if (e.key === 'Backspace' && currentIndex > 0) {
    currentIndex--;
    const { span } = wordSpans[currentIndex];

    // Remove cursor from old position
    if (currentIndex + 1 < wordSpans.length) {
      wordSpans[currentIndex + 1].span.classList.remove('cursor');
    }

    // Revert current char
    if (span.classList.contains('correct')) {
      correctCount--;
    } else if (span.classList.contains('wrong')) {
      wrongCount--;
    }
    totalTyped = Math.max(0, totalTyped - 1);

    span.classList.remove('correct', 'wrong');
    span.classList.add('cursor');

    // Recount WPM / accuracy
    wpmDisplay.textContent = calcWPM();
    const acc = calcAccuracy();
    accuracyBar.style.width   = acc + '%';
    accuracyLabel.textContent = acc + '%';
  }
});

// Keep input focused while game is active (tap anywhere on card)
document.getElementById('typing-card').addEventListener('click', () => {
  if (gameActive) hiddenInput.focus();
});

// ─── Scroll cursor into view ───────────────────────────
function scrollToCursor() {
  if (currentIndex < wordSpans.length) {
    wordSpans[currentIndex].span.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ─── Button Events ─────────────────────────────────────
startBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', initGame);

// ─── Background Canvas Particles ──────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  const COLORS = ['rgba(77,240,212,', 'rgba(131,111,255,', 'rgba(255,111,186,'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles(n = 55) {
    particles = Array.from({ length: n }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.8 + 0.4,
      dx:    (Math.random() - 0.5) * 0.4,
      dy:    (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// ─── Init ──────────────────────────────────────────────
loadHighScore();
