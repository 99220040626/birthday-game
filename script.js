// ===================================================
// 🎉 HAPPY BIRTHDAY KUSHAL! - MAIN SCRIPT
// ===================================================

// 🎊 Create confetti pieces
function createConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#FF6B9D','#FF8C42','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF4560'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 4 + 3) + 's';
    piece.style.animationDelay = (Math.random() * 5) + 's';
    piece.style.width = (Math.random() * 10 + 6) + 'px';
    piece.style.height = (Math.random() * 10 + 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
}

// 🎈 Create background balloons
function createBalloons() {
  const container = document.getElementById('balloons-bg');
  const balloonEmojis = ['🎈','🎈','🎈','🎉','⭐','🌟','✨'];
  for (let i = 0; i < 20; i++) {
    const b = document.createElement('div');
    b.classList.add('bg-balloon');
    b.textContent = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
    b.style.left = Math.random() * 100 + 'vw';
    b.style.animationDuration = (Math.random() * 8 + 8) + 's';
    b.style.animationDelay = (Math.random() * 10) + 's';
    b.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
    container.appendChild(b);
  }
}

// ⭐ Create twinkling stars
function createStars() {
  const container = document.getElementById('stars-bg');
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top  = Math.random() * 100 + 'vh';
    star.style.animationDuration = (Math.random() * 3 + 1) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(star);
  }
}

// 🎵 Background music (generated via AudioContext)
let audioCtx = null;
let musicInterval = null;
let musicPlaying = false;
let gainNode = null;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.5;
  gainNode.connect(audioCtx.destination);
}

// Play a happy birthday jingle note
function playNote(freq, startTime, duration) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.connect(env);
  env.connect(gainNode);
  osc.type = 'triangle';
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
  env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Happy Birthday melody
function playBirthdayMelody() {
  if (!audioCtx) initAudio();
  const bpm = 120;
  const beat = 60 / bpm;
  const now = audioCtx.currentTime + 0.1;
  // Happy Birthday melody frequencies
  const notes = [
    [261,0],[261,0.75],[293,1],[261,2],[349,3],[330,4],
    [261,6],[261,6.75],[293,7],[261,8],[392,9],[349,10],
    [261,12],[261,12.75],[523,13],[440,14],[349,15],[330,16],[293,17],
    [466,19],[466,19.75],[440,20],[349,21],[392,22],[349,23]
  ];
  notes.forEach(([freq, offset]) => {
    playNote(freq, now + offset * beat, beat * 0.9);
  });
}

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  if (!musicPlaying) {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playBirthdayMelody();
    musicInterval = setInterval(playBirthdayMelody, 16000);
    btn.textContent = '🔇 Stop Music';
    musicPlaying = true;
  } else {
    clearInterval(musicInterval);
    btn.textContent = '🎵 Play Music';
    musicPlaying = false;
  }
}

function changeVolume(val) {
  if (gainNode) gainNode.gain.value = parseFloat(val);
}

// 🎆 Launch fireworks
function launchFireworks() {
  const container = document.getElementById('fireworks-display');
  container.innerHTML = '';
  const fireworks = ['🎆','🎇','✨','🌟','💥','🎊','🎉','⭐'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const fw = document.createElement('div');
      fw.classList.add('firework');
      fw.textContent = fireworks[Math.floor(Math.random() * fireworks.length)];
      fw.style.left = (Math.random() * 90) + '%';
      fw.style.top  = (Math.random() * 70 + 10) + '%';
      fw.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
      container.appendChild(fw);
      setTimeout(() => fw.remove(), 1500);
    }, i * 100);
  }
  // Play a celebration sound
  playCelebrationSound();
}

// 🎶 Simple celebration sound
function playCelebrationSound() {
  if (!audioCtx) initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const freqs = [523, 659, 784, 1047];
  freqs.forEach((freq, i) => {
    playNote(freq, audioCtx.currentTime + i * 0.15, 0.4);
  });
}

// ⬇️ Show download info
function showDownloadInfo() {
  const info = document.getElementById('download-info');
  if (info.style.display === 'none') {
    info.style.display = 'block';
    info.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    info.style.display = 'none';
  }
}

// 🎴 Stagger wish cards animation
function animateWishCards() {
  const cards = document.querySelectorAll('.wish-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = (i * 0.15) + 's';
  });
}

// ▶️ Play click sound on game cards
function attachCardSounds() {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      playNote(880, audioCtx.currentTime, 0.1);
    });
  });
}

// ===================================================
// 🚀 INIT on page load
// ===================================================
window.addEventListener('load', () => {
  createConfetti();
  createBalloons();
  createStars();
  animateWishCards();
  attachCardSounds();

  // Animate game cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.game-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
  });
});
