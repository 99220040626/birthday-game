// ===================================================
// 🎯 TARGET HIT GAME
// ===================================================

const GAME_DURATION = 30; // seconds
const TARGET_EMOJIS = ['🎯','⭐','🌟','💎','🏆','🎪','🎠','🎡','🎢','🎀'];
const HIT_MESSAGES  = ['GREAT!','NICE!','WOW!','BOOM!','🔥 HOT!','💥','⭐ YES!'];

let score    = 0;
let hits     = 0;
let timeLeft = GAME_DURATION;
let gameActive = false;
let timerInterval = null;
let targetInterval = null;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playHit() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.start(); osc.stop(audioCtx.currentTime + 0.2);
  } catch(e) {}
}

function startGame() {
  score = 0; hits = 0; timeLeft = GAME_DURATION;
  gameActive = true;
  clearInterval(timerInterval);
  clearInterval(targetInterval);
  updateUI();

  const arena = document.getElementById('target-arena');
  arena.querySelectorAll('.target, .hit-flash, .overlay, #countdown').forEach(e => e.remove());

  // Countdown 3-2-1
  let count = 3;
  const cdEl = document.createElement('div');
  cdEl.id = 'countdown';
  cdEl.textContent = count;
  arena.appendChild(cdEl);

  const cdInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(cdInterval);
      cdEl.remove();
      beginRound(arena);
    } else {
      cdEl.textContent = count;
      cdEl.style.animation = 'none';
      void cdEl.offsetWidth; // reflow
      cdEl.style.animation = 'countdownPulse 1s ease-in-out';
    }
  }, 1000);
}

function beginRound(arena) {
  // Spawn targets regularly
  spawnTarget(arena);
  targetInterval = setInterval(() => spawnTarget(arena), 800);

  // Timer countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    updateUI();
    document.getElementById('timer-bar').style.width = (timeLeft / GAME_DURATION * 100) + '%';
    if (timeLeft <= 0) {
      endGame(arena);
    }
  }, 1000);
}

function spawnTarget(arena) {
  if (!gameActive) return;
  const t = document.createElement('div');
  t.classList.add('target');
  t.textContent = TARGET_EMOJIS[Math.floor(Math.random() * TARGET_EMOJIS.length)];

  const maxLeft = arena.clientWidth  - 70;
  const maxTop  = arena.clientHeight - 70;
  t.style.left = (Math.random() * maxLeft + 10) + 'px';
  t.style.top  = (Math.random() * maxTop  + 10) + 'px';

  // Animate the target moving
  const dur = (Math.random() * 1.5 + 0.8).toFixed(2);
  t.style.animation = `floatTarget ${dur}s ease-in-out infinite`;

  t.addEventListener('click', (e) => {
    if (!gameActive) return;
    hitTarget(t, arena, e);
  });
  arena.appendChild(t);

  // Auto-remove if not hit
  setTimeout(() => { if (t.parentNode) t.remove(); }, 2500);
}

// Inject float animation into arena dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes floatTarget {
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50%       { transform: translateY(-12px) rotate(5deg); }
  }
`;
document.head.appendChild(style);

function hitTarget(el, arena, e) {
  const rect  = arena.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  el.remove();
  playHit();

  const pts = 10 + Math.floor(timeLeft / 3);
  score += pts;
  hits++;
  updateUI();

  // Show message
  const msg = document.createElement('div');
  msg.classList.add('hit-flash');
  msg.textContent = HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)] + ' +' + pts;
  msg.style.left  = (elRect.left - rect.left + 20) + 'px';
  msg.style.top   = (elRect.top  - rect.top + 10) + 'px';
  msg.style.color = ['var(--yellow)','var(--pink)','var(--green)','var(--blue)'][Math.floor(Math.random()*4)];
  arena.appendChild(msg);
  setTimeout(() => msg.remove(), 700);
}

function endGame(arena) {
  gameActive = false;
  clearInterval(timerInterval);
  clearInterval(targetInterval);
  arena.querySelectorAll('.target').forEach(t => t.remove());

  let grade = '⭐';
  let msg   = 'Good try!';
  if (hits >= 30)      { grade = '🏆'; msg = 'INCREDIBLE! You\'re a champion!'; }
  else if (hits >= 20) { grade = '🥇'; msg = 'Fantastic shooting, Kushal!'; }
  else if (hits >= 10) { grade = '🥈'; msg = 'Great job! Keep it up!'; }

  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  overlay.innerHTML = `
    <div class="overlay-emoji">${grade}</div>
    <div class="overlay-title">Time's Up!</div>
    <div class="overlay-msg">${msg}<br/>Hits: <strong>${hits}</strong> | Score: <strong>${score}</strong> 🎉</div>
    <button class="btn btn-primary" onclick="startGame()">🔄 Play Again!</button>
    <a href="../index.html" class="btn btn-success" style="text-decoration:none; margin:0.5rem;">🏠 Home</a>
  `;
  arena.appendChild(overlay);
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('hits').textContent  = hits;
  document.getElementById('time').textContent  = timeLeft;
}
