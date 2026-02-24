/* =====================================================
   BoltType — app.js
   Original 5-line scroll version + word-break fix
   ===================================================== */
'use strict';

// ─── Service Worker ───────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(r  => console.log('[SW]', r.scope))
      .catch(e => console.warn('[SW] fail', e));
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

// ─── DOM ──────────────────────────────────────────────
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

// ─── State ────────────────────────────────────────────
const GAME_DURATION = 60;
let words         = [];
let wordSpans     = [];
let currentIndex  = 0;
let correctCount  = 0;
let wrongCount    = 0;
let totalTyped    = 0;
let timerInterval = null;
let timeLeft      = GAME_DURATION;
let gameActive    = false;
let gameStarted   = false;
let highScore     = 0;
let activeLine    = 0;   // which line we've scrolled to
let lineHeight    = 0;   // px height of one rendered line

// ─── High Score ───────────────────────────────────────
function loadHighScore() {
  highScore = parseInt(localStorage.getItem('bolttype_highscore') || '0', 10);
  highscoreDisplay.textContent = highScore;
}
function saveHighScore(s) {
  if (s > highScore) {
    highScore = s;
    localStorage.setItem('bolttype_highscore', highScore);
    highscoreDisplay.textContent = highScore;
    return true;
  }
  return false;
}

// ─── Generate words ───────────────────────────────────
function generateWords(n = 100) {
  return Array.from({ length: n }, () =>
    WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
}

// ─── Build text DOM ───────────────────────────────────
function buildTextDisplay() {
  textDisplay.innerHTML = '';
  wordSpans = [];

  words.forEach((word, wi) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';

    [...word].forEach(ch => {
      const s = document.createElement('span');
      s.textContent = ch;
      wordEl.appendChild(s);
      wordSpans.push({ span: s, char: ch });
    });

    // Space after every word except the last
    if (wi < words.length - 1) {
      const sp = document.createElement('span');
      sp.textContent = ' ';
      wordEl.appendChild(sp);
      wordSpans.push({ span: sp, char: ' ' });
    }

    textDisplay.appendChild(wordEl);
  });

  if (wordSpans.length) wordSpans[0].span.classList.add('cursor');
}

// ─── Measure one real line height ─────────────────────
function measureLineHeight() {
  if (!wordSpans.length) return;
  lineHeight = wordSpans[0].span.getBoundingClientRect().height * 1.9;
}

// ─── Scroll: keep cursor in 5-line window ─────────────
// Compares cursor's rendered top to container top.
// Scrolls up one line whenever cursor goes past line 2.
// Scrolls back down on backspace.
function scrollToCursor() {
  if (!lineHeight || currentIndex >= wordSpans.length) return;

  const containerTop = textDisplay.getBoundingClientRect().top;
  const cursorTop    = wordSpans[currentIndex].span.getBoundingClientRect().top;
  const linesBelow   = Math.round((cursorTop - containerTop) / lineHeight);

  if (linesBelow > 2) {
    activeLine++;
    textDisplay.scrollTop = activeLine * lineHeight;
  }
  if (linesBelow < 1 && activeLine > 0) {
    activeLine--;
    textDisplay.scrollTop = activeLine * lineHeight;
  }
}

// ─── Timer ────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 10) timerDisplay.style.color = 'var(--wrong)';
    if (timeLeft <= 0)  endGame();
  }, 1000);
}

// ─── WPM / Accuracy ───────────────────────────────────
function calcWPM() {
  const m = (GAME_DURATION - timeLeft) / 60;
  return m === 0 ? 0 : Math.round((correctCount / 5) / m);
}
function calcAccuracy() {
  return totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
}
function updateStats() {
  wpmDisplay.textContent = calcWPM();
  const acc = calcAccuracy();
  accuracyBar.style.width      = acc + '%';
  accuracyLabel.textContent    = acc + '%';
  accuracyBar.style.background = acc < 70
    ? 'linear-gradient(90deg, var(--wrong), #ff8a00)'
    : 'linear-gradient(90deg, var(--cyan), var(--violet))';
}

// ─── Game Flow ────────────────────────────────────────
function initGame() {
  clearInterval(timerInterval);
  currentIndex = correctCount = wrongCount = totalTyped = 0;
  timeLeft     = GAME_DURATION;
  gameActive   = gameStarted = false;
  activeLine   = 0;
  lineHeight   = 0;

  timerDisplay.textContent = GAME_DURATION;
  timerDisplay.style.color = '';
  wpmDisplay.textContent   = '0';

  // Show the card BEFORE building so getBoundingClientRect works
  idleScreen.style.display   = 'none';
  textDisplay.style.display  = 'block';
  textDisplay.scrollTop      = 0;
  accuracyWrap.style.display = 'flex';
  accuracyBar.style.width    = '100%';
  accuracyLabel.textContent  = '100%';
  resultsOverlay.style.display = 'none';
  startBtn.style.display       = 'none';
  resetBtn.style.display       = 'inline-flex';
  modeBadge.textContent = 'TYPE!';
  modeBadge.className   = 'badge active';

  words = generateWords(100);
  buildTextDisplay();

  // Measure after browser paints
  requestAnimationFrame(() => measureLineHeight());

  hiddenInput.value = '';
  hiddenInput.focus();
  gameActive = true;
}

function endGame() {
  clearInterval(timerInterval);
  gameActive = false;
  hiddenInput.blur();
  const wpm   = calcWPM();
  const acc   = calcAccuracy();
  const isNew = saveHighScore(wpm);
  resultWpm.textContent   = wpm;
  resultAcc.textContent   = acc + '%';
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
  textDisplay.scrollTop      = 0;
  accuracyWrap.style.display = 'none';
  resultsOverlay.style.display = 'none';
  timerDisplay.textContent   = GAME_DURATION;
  timerDisplay.style.color   = '';
  wpmDisplay.textContent     = '0';
  modeBadge.textContent      = 'READY';
  modeBadge.className        = 'badge';
}

// ─── Input ────────────────────────────────────────────
hiddenInput.addEventListener('input', () => {
  if (!gameActive) return;
  if (!gameStarted) { gameStarted = true; startTimer(); }

  const val = hiddenInput.value;
  if (!val.length) return;
  const typedChar = val[val.length - 1];
  hiddenInput.value = '';

  if (currentIndex >= wordSpans.length) return;

  const { span, char } = wordSpans[currentIndex];
  span.classList.remove('cursor');
  totalTyped++;

  if (typedChar === char) { span.classList.add('correct'); correctCount++; }
  else                    { span.classList.add('wrong');   wrongCount++;   }

  currentIndex++;

  if (currentIndex < wordSpans.length) {
    wordSpans[currentIndex].span.classList.add('cursor');
    scrollToCursor();
  } else {
    // Append more words without resetting scroll
    const extra = generateWords(100);
    extra.forEach((word, wi) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      [...word].forEach(ch => {
        const s = document.createElement('span');
        s.textContent = ch;
        wordEl.appendChild(s);
        wordSpans.push({ span: s, char: ch });
      });
      const sp = document.createElement('span');
      sp.textContent = ' ';
      wordEl.appendChild(sp);
      wordSpans.push({ span: sp, char: ' ' });
      textDisplay.appendChild(wordEl);
    });
    wordSpans[currentIndex].span.classList.add('cursor');
  }

  updateStats();
});

// ─── Backspace ────────────────────────────────────────
hiddenInput.addEventListener('keydown', (e) => {
  if (!gameActive || e.key !== 'Backspace' || currentIndex <= 0) return;
  currentIndex--;
  const { span } = wordSpans[currentIndex];
  if (currentIndex + 1 < wordSpans.length)
    wordSpans[currentIndex + 1].span.classList.remove('cursor');
  if (span.classList.contains('correct'))    correctCount--;
  else if (span.classList.contains('wrong')) wrongCount--;
  totalTyped = Math.max(0, totalTyped - 1);
  span.classList.remove('correct', 'wrong');
  span.classList.add('cursor');
  scrollToCursor();
  updateStats();
});

// Tap card to keep keyboard open
document.getElementById('typing-card').addEventListener('click', () => {
  if (gameActive) hiddenInput.focus();
});

// ─── Buttons ──────────────────────────────────────────
startBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', initGame);

// ─── Background particles ─────────────────────────────
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, P;
  const C = ['rgba(77,240,212,', 'rgba(131,111,255,', 'rgba(255,111,186,'];
  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  const make   = (n = 55) => P = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.8 + 0.4,
    dx: (Math.random() - .5) * .4, dy: (Math.random() - .5) * .4,
    c: C[Math.floor(Math.random() * C.length)],
    a: Math.random() * .5 + .1
  }));
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    P.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.a + ')'; ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  };
  resize(); make(); draw();
  window.addEventListener('resize', () => { resize(); make(); });
})();

loadHighScore();
