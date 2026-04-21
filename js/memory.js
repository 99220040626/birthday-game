// ===================================================
// 🧠 MEMORY MATCH GAME
// ===================================================

const CARD_EMOJIS = ['🎂','🎈','🎁','🎉','🎊','⭐','🌟','🏆'];
let flipped  = [];
let matched  = 0;
let moves    = 0;
let score    = 0;
let canFlip  = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playFlip() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
  } catch(e) {}
}
function playMatch() {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    [523, 659, 784].forEach((f, i) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.25);
      osc.start(audioCtx.currentTime + i * 0.1);
      osc.stop(audioCtx.currentTime + i * 0.1 + 0.25);
    });
  } catch(e) {}
}

function initGame() {
  flipped = []; matched = 0; moves = 0; score = 0;
  canFlip = true;
  updateUI();

  // Shuffle cards: 2 of each emoji
  const deck = [...CARD_EMOJIS, ...CARD_EMOJIS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  deck.forEach((emoji, idx) => {
    const card = document.createElement('div');
    card.classList.add('mem-card');
    card.dataset.emoji = emoji;
    card.dataset.idx   = idx;
    card.innerHTML = `
      <div class="mem-inner">
        <div class="mem-back"></div>
        <div class="mem-front">${emoji}</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (!canFlip) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flipped.length >= 2) return;

  playFlip();
  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    updateUI();
    canFlip = false;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flipped;
  if (a.dataset.emoji === b.dataset.emoji) {
    // Match!
    setTimeout(() => {
      a.classList.add('matched');
      b.classList.add('matched');
      playMatch();
      matched++;
      score += Math.max(10, 50 - moves);
      flipped = [];
      canFlip = true;
      updateUI();
      if (matched === CARD_EMOJIS.length) setTimeout(winGame, 500);
    }, 300);
  } else {
    // No match
    a.querySelector('.mem-inner').classList.add('wrong');
    b.querySelector('.mem-inner').classList.add('wrong');
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      a.querySelector('.mem-inner').classList.remove('wrong');
      b.querySelector('.mem-inner').classList.remove('wrong');
      flipped = [];
      canFlip = true;
    }, 900);
  }
}

function winGame() {
  let stars = '⭐⭐⭐';
  let grade  = 'Perfect! You\'re a memory master, Kushal! 🧠✨';
  if (moves > 20)      { stars = '⭐⭐'; grade = 'Great job! You matched them all! 🎉'; }
  if (moves > 30)      { stars = '⭐';   grade = 'You did it! Great persistence! 💪'; }

  // Confetti burst
  const colors = ['#FF6B9D','#FFD93D','#6BCB77','#4D96FF','#C77DFF'];
  const body   = document.body;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed; top:-10px; border-radius:3px;
      pointer-events:none; z-index:300;
      width:${Math.random()*10+5}px; height:${Math.random()*10+5}px;
      left:${Math.random()*100}vw;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation: fall ${Math.random()*2+1}s linear ${Math.random()*1}s forwards;
    `;
    body.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }
  const style = document.createElement('style');
  style.textContent = '@keyframes fall { to { transform: translateY(110vh) rotate(360deg); opacity:0; } }';
  document.head.appendChild(style);

  const overlay = document.getElementById('win-overlay');
  document.getElementById('win-msg').innerHTML = `${grade}<br/>Moves: <strong>${moves}</strong> | Score: <strong>${score}</strong><br/>${stars}`;
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
}

function updateUI() {
  document.getElementById('moves').textContent   = moves;
  document.getElementById('matched').textContent = matched + ' / ' + CARD_EMOJIS.length;
  document.getElementById('score').textContent   = score;
}

// Start on load
window.addEventListener('load', initGame);
