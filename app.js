/* =====================================================
   BoltType — app.js  (v3 — line-map scroll)
   ===================================================== */
'use strict';

// ─── Register Service Worker ─────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg  => console.log('[SW] Registered:', reg.scope))
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
const timerDisplay     = document.getElementById('timer-display');
const wpmDisplay       = document.getElementById('wpm-display');
const highscoreDisplay = document.getElementById('highscore-display');
const textDisplay      = document.getElementById('text-display');
const hiddenInput      = document.getElementById('hidden-input');
const startBtn         = document.getElementById('start-btn');
const resetBtn         = document.getElementById('reset-btn');
const idleScreen       = document.getElementById('idle-screen');
const accuracyWrap     = document.getElementById('accuracy-wrap');
const accuracyBar      = document.getElementById('accuracy-bar');
const accuracyLabel    = document.getElementById('accuracy-label');
const modeBadge        = document.getElementById('mode-badge');
const resultsOverlay   = document.getElementById('results-overlay');
const resultWpm        = document.getElementById('result-wpm');
const resultAcc        = document.getElementById('result-acc');
const resultChars      = document.getElementById('result-chars');
const newBest          = document.getElementById('new-best');
const playAgainBtn     = document.getElementById('play-again-btn');

// ─── State ─────────────────────────────────────────────
const GAME_DURATION = 60;

let words        = [];
let wordSpans    = [];      // [{span, char}, ...]
let currentIndex = 0;
let correctCount = 0;
let wrongCount   = 0;
let totalTyped   = 0;
let timerInterval= null;
let timeLeft     = GAME_DURATION;
let gameActive   = false;
let gameStarted  = false;
let highScore    = 0;

// ─── Line-map scroll state ─────────────────────────────
// lineStarts[i] = the charIndex at which line i begins
// lineH = one rendered line's pixel height (font-size × line-height)
let lineStarts   = [];
let lineH        = 0;
let currentLine  = 0;       // which line the cursor is on

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

// Build DOM — text-display must already be visible when this is called
function buildTextDisplay() {
  textDisplay.innerHTML = '';
  wordSpans = [];

  const inner = document.createElement('div');
  inner.id = 'text-inner';

  words.forEach((word, wi) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';

    [...word].forEach(char => {
      const s = document.createElement('span');
      s.textContent = char;
      wordEl.appendChild(s);
      wordSpans.push({ span: s, char });
    });

    if (wi < words.length - 1) {
      const sp = document.createElement('span');
      sp.textContent = ' ';
      wordEl.appendChild(sp);
      wordSpans.push({ span: sp, char: ' ' });
    }

    inner.appendChild(wordEl);
  });

  textDisplay.appendChild(inner);

  // Set opening cursor
  if (wordSpans.length) wordSpans[0].span.classList.add('cursor');
}

// ─── Build a line-start map AFTER DOM is rendered ─────
// Compares the .top of each char span (via getBoundingClientRect)
// to discover where each new visual line starts.
function measureLineMap() {
  lineStarts  = [];
  lineH       = 0;
  currentLine = 0;

  if (!wordSpans.length) return;

  // Measure one character's rendered height
  const firstRect = wordSpans[0].span.getBoundingClientRect();
  lineH = firstRect.height * 1.9; // matches CSS line-height: 1.9

  let lastTop = Math.round(firstRect.top);
  lineStarts.push(0);

  for (let i = 1; i < wordSpans.length; i++) {
    const t = Math.round(wordSpans[i].span.getBoundingClientRect().top);
    // A new line has started if top moved down by more than half a char
    if (t > lastTop + firstRect.height * 0.5) {
      lineStarts.push(i);
      lastTop = t;
    }
  }
}

// ─── Timer ─────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 10) timerDisplay.style.color = 'var(--wrong)';
    if (timeLeft <= 0)  endGame();
  }, 1000);
}

// ─── WPM / Accuracy ────────────────────────────────────
function calcWPM() {
  const mins = (GAME_DURATION - timeLeft) / 60;
  if (mins === 0) return 0;
  return Math.round((correctCount / 5) / mins);
}
function calcAccuracy() {
  if (totalTyped === 0) return 100;
  return Math.round((correctCount / totalTyped) * 100);
}

// ─── Game Flow ─────────────────────────────────────────
function initGame() {
  clearInterval(timerInterval);
  currentIndex = correctCount = wrongCount = totalTyped = 0;
  timeLeft     = GAME_DURATION;
  gameActive   = gameStarted = false;
  currentLine  = 0;

  timerDisplay.textContent = GAME_DURATION;
  timerDisplay.style.color = '';
  wpmDisplay.textContent   = '0';

  // ── Show text-display BEFORE building so getBoundingClientRect works ──
  idleScreen.style.display   = 'none';
  textDisplay.style.display  = 'block';
  accuracyWrap.style.display = 'flex';
  accuracyBar.style.width    = '100%';
  accuracyLabel.textContent  = '100%';
  resultsOverlay.style.display = 'none';
  startBtn.style.display       = 'none';
  resetBtn.style.display       = 'inline-flex';
  modeBadge.textContent = 'TYPE!';
  modeBadge.className   = 'badge active';

  words = generateWords(80);
  buildTextDisplay();

  // Measure line positions after a paint so layout is settled
  requestAnimationFrame(() => {
    measureLineMap();
    // Reset inner position without animation
    const inner = document.getElementById('text-inner');
    if (inner) {
      inner.style.transition = 'none';
      inner.style.transform  = 'translateY(0px)';
      // Re-enable transition after one frame
      requestAnimationFrame(() => {
        if (inner) inner.style.transition = '';
      });
    }
  });

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

  resultWpm.textContent   = finalWPM;
  resultAcc.textContent   = finalAcc + '%';
  resultChars.textContent = correctCount;
  newBest.style.display   = isNew ? 'block' : 'none';
  modeBadge.textContent   = 'DONE';
  modeBadge.className     = 'badge done';
  resultsOverlay.style.display = 'flex';
}

function resetGame() {
  clearInterval(timerInterval);
  gameActive = false;
  hiddenInput.value = '';
  startBtn.style.display     = 'block';
  resetBtn.style.display     = 'none';
  idleScreen.style.display   = 'flex';
  textDisplay.style.display  = 'none';
  accuracyWrap.style.display = 'none';
  resultsOverlay.style.display = 'none';
  timerDisplay.textContent   = GAME_DURATION;
  timerDisplay.style.color   = '';
  wpmDisplay.textContent     = '0';
  modeBadge.textContent      = 'READY';
  modeBadge.className        = 'badge';
}

// ─── Smooth line scroll ────────────────────────────────
// Uses the pre-built lineStarts map. Finds which line
// currentIndex is on, then sets translateY to keep it
// always on the SECOND visible line (so there's context).
function scrollToCursor() {
  if (!lineStarts.length || !lineH) return;

  const inner = document.getElementById('text-inner');
  if (!inner) return;

  // Find cursor's line using the line-start map
  let line = 0;
  for (let i = lineStarts.length - 1; i >= 0; i--) {
    if (currentIndex >= lineStarts[i]) {
      line = i;
      break;
    }
  }

  // No change needed if still on the same line
  if (line === currentLine) return;
  currentLine = line;

  // Always keep cursor on line index 1 (2nd row) so there's
  // one "done" line above and fresh lines below — just like
  // MonkeyType / typeracer feel.
  const targetScrollLine = Math.max(0, line - 1);
  const newY = -(targetScrollLine * lineH);

  inner.style.transform = `translateY(${newY}px)`;
}

// ─── Input Handling ────────────────────────────────────
hiddenInput.addEventListener('input', () => {
  if (!gameActive) return;

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  const typed = hiddenInput.value;
  if (!typed.length) return;

  const typedChar = typed[typed.length - 1];
  hiddenInput.value = '';

  if (currentIndex >= wordSpans.length) return;

  const { span, char } = wordSpans[currentIndex];
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

  if (currentIndex < wordSpans.length) {
    wordSpans[currentIndex].span.classList.add('cursor');
    scrollToCursor();
  } else {
    // All words typed — generate a new batch
    words = generateWords(80);
    buildTextDisplay();
    currentLine = 0;
    requestAnimationFrame(() => {
      measureLineMap();
      const inner = document.getElementById('text-inner');
      if (inner) {
        inner.style.transition = 'none';
        inner.style.transform  = 'translateY(0px)';
        requestAnimationFrame(() => { if (inner) inner.style.transition = ''; });
      }
    });
    currentIndex = 0;
  }

  // Live stats
  wpmDisplay.textContent = calcWPM();
  const acc = calcAccuracy();
  accuracyBar.style.width     = acc + '%';
  accuracyLabel.textContent   = acc + '%';
  accuracyBar.style.background = acc < 70
    ? 'linear-gradient(90deg, var(--wrong), #ff8a00)'
    : 'linear-gradient(90deg, var(--cyan), var(--violet))';
});

// Backspace
hiddenInput.addEventListener('keydown', (e) => {
  if (!gameActive || e.key !== 'Backspace' || currentIndex <= 0) return;

  currentIndex--;
  const { span } = wordSpans[currentIndex];

  if (currentIndex + 1 < wordSpans.length)
    wordSpans[currentIndex + 1].span.classList.remove('cursor');

  if (span.classList.contains('correct'))      correctCount--;
  else if (span.classList.contains('wrong'))   wrongCount--;
  totalTyped = Math.max(0, totalTyped - 1);

  span.classList.remove('correct', 'wrong');
  span.classList.add('cursor');

  // Re-measure cursor line for backspace scrollback
  scrollToCursor();

  wpmDisplay.textContent = calcWPM();
  const acc = calcAccuracy();
  accuracyBar.style.width   = acc + '%';
  accuracyLabel.textContent = acc + '%';
});

// Re-focus input when tapping the card
document.getElementById('typing-card').addEventListener('click', () => {
  if (gameActive) hiddenInput.focus();
});

// ─── Button Events ─────────────────────────────────────
startBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', initGame);

// ─── Background Canvas Particles ──────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;
  const COLORS = ['rgba(77,240,212,','rgba(131,111,255,','rgba(255,111,186,'];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function createParticles(n = 55) {
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
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
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize(); createParticles(); draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// ─── Init ──────────────────────────────────────────────
loadHighScore();
