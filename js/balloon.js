// ===================================================
// 🎈 BALLOON POP GAME
// ===================================================

const TOTAL_BALLOONS = 20;
const balloonEmojis = ['🎈','🎈','🎈','🎈','🟣','🔵','🟡','🔴','🟢','🟠'];
const funMessages = ['POP!','💥 YES!','🎉 WOW!','👏 NICE!','⭐ COOL!','🌟 BOOM!'];

let poppedCount = 0;
let score = 0;
let gameActive = false;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playPop() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.15, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    src.buffer = buf;
    src.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.3;
    src.start();
  } catch(e) {}
}

function startGame() {
  poppedCount = 0;
  score = 0;
  gameActive = true;
  updateUI();

  const arena = document.getElementById('balloon-arena');
  // Remove old balloons & overlays except start
  arena.querySelectorAll('.balloon, .pop-text, .overlay').forEach(el => el.remove());

  // Spawn balloons
  for (let i = 0; i < TOTAL_BALLOONS; i++) {
    spawnBalloon(arena, i * 100);
  }
}

function spawnBalloon(arena, delay) {
  setTimeout(() => {
    if (!gameActive) return;
    const b = document.createElement('div');
    b.classList.add('balloon');
    b.textContent = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];

    // Random position (keep inside bounds)
    const maxLeft = arena.clientWidth - 60;
    const maxTop  = arena.clientHeight - 80;
    b.style.left = (Math.random() * maxLeft + 10) + 'px';
    b.style.top  = (Math.random() * maxTop + 10) + 'px';
    b.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    b.style.animationDelay = '-' + (Math.random() * 2) + 's';

    b.addEventListener('click', () => popBalloon(b, arena));
    arena.appendChild(b);
  }, delay);
}

function popBalloon(el, arena) {
  if (el.classList.contains('popping')) return;
  el.classList.add('popping');
  playPop();

  // Show fun pop text
  const msg = document.createElement('div');
  msg.classList.add('pop-text');
  msg.textContent = funMessages[Math.floor(Math.random() * funMessages.length)];
  msg.style.left = el.style.left;
  msg.style.top  = el.style.top;
  arena.appendChild(msg);
  setTimeout(() => msg.remove(), 800);

  setTimeout(() => el.remove(), 300);

  poppedCount++;
  score += 10;
  updateUI();

  if (poppedCount >= TOTAL_BALLOONS) {
    setTimeout(() => winGame(arena), 400);
  }
}

function updateUI() {
  document.getElementById('popped-count').textContent = poppedCount;
  document.getElementById('left-count').textContent = TOTAL_BALLOONS - poppedCount;
  document.getElementById('score').textContent = score;
  const pct = (poppedCount / TOTAL_BALLOONS) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}

function winGame(arena) {
  gameActive = false;
  // Confetti burst
  const confetti = document.createElement('div');
  confetti.classList.add('confetti-overlay');
  const colors = ['#FF6B9D','#FFD93D','#6BCB77','#4D96FF','#C77DFF'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.classList.add('mini-confetti');
    p.style.left = (Math.random() * 100) + '%';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (Math.random() * 1.5 + 0.8) + 's';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    confetti.appendChild(p);
  }
  arena.appendChild(confetti);
  setTimeout(() => confetti.remove(), 2500);

  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  overlay.innerHTML = `
    <div class="overlay-emoji">🎉</div>
    <div class="overlay-title">All Popped!</div>
    <div class="overlay-msg">Amazing, Kushal! Score: <strong>${score}</strong> 🌟</div>
    <button class="btn btn-primary" onclick="startGame()">🔄 Play Again!</button>
    <a href="../index.html" class="btn btn-success" style="text-decoration:none; margin:0.5rem;">🏠 Home</a>
  `;
  arena.appendChild(overlay);
}
