// ===================================================
// 🎁 GIFT SURPRISE GAME
// ===================================================

const GIFTS = [
  { emoji: '🦸', msg: 'You\'re a Superhero!' },
  { emoji: '🚀', msg: 'Reach the stars!' },
  { emoji: '🏆', msg: 'You\'re a Champion!' },
  { emoji: '🎂', msg: 'Happy Birthday!' },
  { emoji: '💎', msg: 'You\'re precious!' },
  { emoji: '🌈', msg: 'You bring joy!' },
  { emoji: '🦁', msg: 'Brave and bold!' },
  { emoji: '⭐', msg: 'Shining star!' },
  { emoji: '🎉', msg: 'Celebrate YOU!' }
];

const GIFT_BOXES = ['🎁','🎀','📦','🎊','🎈','🎏'];

let openedCount = 0;
let score = 0;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playReveal(idx) {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const freqs = [523, 659, 784, 1047, 1319];
    freqs.slice(0, 3 + idx % 3).forEach((f, i) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.12 + 0.3);
      osc.start(audioCtx.currentTime + i * 0.12);
      osc.stop(audioCtx.currentTime + i * 0.12 + 0.3);
    });
  } catch(e) {}
}

function initGame() {
  openedCount = 0;
  score = 0;
  updateUI();
  document.getElementById('big-message').textContent = '🎁 Click a gift to open it!';
  document.getElementById('all-open-section').style.display = 'none';

  // Shuffle gifts
  const shuffled = [...GIFTS].sort(() => Math.random() - 0.5);
  const zone = document.getElementById('gift-zone');
  zone.innerHTML = '';

  shuffled.forEach((gift, i) => {
    const box = document.createElement('div');
    box.classList.add('gift-box');
    box.dataset.idx = i;

    const boxEmoji = GIFT_BOXES[Math.floor(Math.random() * GIFT_BOXES.length)];
    box.innerHTML = `
      <div class="shine-ring"></div>
      <span class="gift-emoji">${boxEmoji}</span>
      <div class="gift-msg">${gift.msg}</div>
    `;

    box.addEventListener('click', () => openGift(box, gift, i));
    zone.appendChild(box);
  });
}

function openGift(box, gift, idx) {
  if (box.classList.contains('opened')) return;

  box.classList.add('opened');
  box.querySelector('.gift-emoji').textContent = gift.emoji;
  playReveal(idx);

  openedCount++;
  score += 50 + (idx * 10);
  updateUI();

  // Big message
  const msg = document.getElementById('big-message');
  msg.textContent = '🎉 ' + gift.msg + ' 🎉';
  msg.style.animation = 'none';
  void msg.offsetWidth;
  msg.style.animation = 'fadeInUp 0.5s ease';

  // Mini confetti burst
  burstConfetti(box);

  if (openedCount >= GIFTS.length) {
    setTimeout(allOpened, 600);
  }
}

function burstConfetti(box) {
  const container = document.getElementById('confetti-burst');
  const rect = box.getBoundingClientRect();
  const colors = ['#FF6B9D','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF8C42'];

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 10 + 5;
    p.style.cssText = `
      position:fixed;
      left:${rect.left + rect.width/2}px;
      top:${rect.top + rect.height/2}px;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events:none;
      animation: burstOut 0.8s ease-out forwards;
      --dx:${(Math.random() - 0.5) * 200}px;
      --dy:${(Math.random() - 1) * 150}px;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  // Inject keyframe
  if (!document.getElementById('burst-style')) {
    const s = document.createElement('style');
    s.id = 'burst-style';
    s.textContent = `
      @keyframes burstOut {
        0%   { transform: translate(0,0) scale(0); opacity:1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
}

function allOpened() {
  // Big confetti shower
  const container = document.getElementById('confetti-burst');
  const colors = ['#FF6B9D','#FFD93D','#6BCB77','#4D96FF','#C77DFF'];
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      const size = Math.random() * 12 + 6;
      p.style.cssText = `
        position:fixed; top:-20px;
        left:${Math.random() * 100}vw;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
        pointer-events:none;
        animation: fall2 ${Math.random()*2+1.5}s linear forwards;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }, i * 40);
  }
  if (!document.getElementById('fall2-style')) {
    const s = document.createElement('style');
    s.id = 'fall2-style';
    s.textContent = `@keyframes fall2 { to { transform: translateY(110vh) rotate(360deg); opacity:0; } }`;
    document.head.appendChild(s);
  }

  document.getElementById('all-open-section').style.display = 'block';
  document.getElementById('all-open-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateUI() {
  document.getElementById('opened').textContent = openedCount + ' / ' + GIFTS.length;
  document.getElementById('score').textContent  = score;
}

window.addEventListener('load', initGame);
