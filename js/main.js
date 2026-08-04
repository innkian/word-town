// Word Town — screens, navigation, rewards, and the grown-ups panel.

const App = (() => {
  const screens = {};
  document.querySelectorAll('.screen').forEach(s => { screens[s.id.replace('screen-', '')] = s; });

  function show(name) {
    Speech.stop();
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    updateStars();
    if (name === 'delivery') Delivery.start();
    else if (name === 'shop') Shop.start();
    else if (name === 'sounds') Sounds.start();
    else if (name === 'story') Story.start();
    else if (name === 'garage') renderGarage();
    else if (name === 'town') Speech.say('Where shall we go?');
  }

  function updateStars() {
    const n = Mastery.state.stars;
    document.getElementById('star-count').textContent = n;
    document.querySelectorAll('.star-count-live').forEach(el => { el.textContent = n; });
    const cars = Mastery.state.unlockedCars;
    document.getElementById('garage-count').textContent = `(${cars} car${cars === 1 ? '' : 's'})`;
  }

  // ---------- celebration + rewards ----------
  const overlay = document.getElementById('celebrate');
  const overlayEmoji = document.getElementById('celebrate-emoji');
  const overlayText = document.getElementById('celebrate-text');

  function confettiBurst() {
    for (let i = 0; i < 24; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.textContent = ['🎉', '⭐', '🎈', '✨', '🚗'][i % 5];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.animationDuration = (1.4 + Math.random() * 1.6) + 's';
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      overlay.appendChild(c);
      setTimeout(() => c.remove(), 3400);
    }
  }

  function showOverlay(emoji, text, ms) {
    overlayEmoji.textContent = emoji;
    overlayText.textContent = text;
    overlay.classList.remove('hidden');
    confettiBurst();
    setTimeout(() => overlay.classList.add('hidden'), ms);
  }

  // Called by every mini-game when a round of 5 is complete.
  function finishRound(emoji, text) {
    Mastery.addStar();
    updateStars();
    showOverlay(emoji, text + ' ⭐', 2400);
    Speech.say('You earned a star!');
    if (Mastery.pendingCarUnlock()) {
      setTimeout(() => {
        const car = Mastery.claimCar();
        updateStars();
        showOverlay(car, 'A new car for your garage!', 3000);
        Speech.say('Wow! You earned a brand new car for your garage!');
      }, 2600);
    }
  }

  // ---------- garage ----------
  function renderGarage() {
    const shelf = document.getElementById('garage-shelf');
    shelf.innerHTML = '';
    const owned = Mastery.state.unlockedCars;
    REWARD_CARS.forEach((car, i) => {
      const d = document.createElement('div');
      d.className = 'garage-car' + (i < owned ? '' : ' locked');
      d.textContent = i < owned ? car : '🔒';
      shelf.appendChild(d);
    });
    const need = 5 - (Mastery.state.stars % 5);
    document.getElementById('garage-hint').textContent =
      owned >= REWARD_CARS.length ? 'You collected every car! 🏆' : `${need} more ⭐ until your next car!`;
    Speech.say(owned === 1
      ? 'This is your garage! Earn stars to collect more cars!'
      : `Look at all your cars! You have ${owned}. ${need} more stars until the next one!`);
  }

  // ---------- grown-ups panel (hold 1.5s) ----------
  const grownups = document.getElementById('grownups');
  function conceptLabel(key) {
    const [kind, val] = key.split(':');
    switch (kind) {
      case 'noun': return val;
      case 'size': return `"${val}"`;
      case 'prep': return `"${val} the box"`;
      case 'wh': return val + ' questions';
      case 'seq': return 'two-step directions';
      case 'action': return val + ' (who is…?)';
      case 'fn': return val + ' (what it\'s for)';
      case 'cat': return val + ' category';
      case 'odd': return 'odd one out';
      default: return val;
    }
  }
  function bars(summary) {
    if (!summary.concepts.length) return '<p>Not played yet.</p>';
    return summary.concepts.slice(0, 8).map(c =>
      `<div class="mastery-bar"><div class="label">${conceptLabel(c.key)}</div>
       <div class="track"><div class="fill" style="width:${Math.round(c.score * 100)}%"></div></div></div>`).join('');
  }
  function openGrownups() {
    const listen = Mastery.skillSummary('listen');
    const shop = Mastery.skillSummary('shop');
    const practiced = Object.entries(Mastery.state.soundsPracticed).sort((a, b) => b[1] - a[1]);
    const acc = s => s.recentAccuracy == null ? '' : ` · recent accuracy ${s.recentAccuracy}%`;
    document.getElementById('grownups-body').innerHTML = `
      <p>Word Town practises the areas from Zac's kindergarten speech screening:
      listening comprehension, word meanings, story telling, and his target sounds
      (<b>/l/</b>, <b>/y/</b>, <b>/zh/</b>). Difficulty adjusts automatically.</p>

      <h3>🚚 Delivery Run — comprehension (level ${listen.level}/4${acc(listen)})</h3>
      ${bars(listen)}
      ${listen.weak.length ? `<div class="tip">Practise together: ${listen.weak.map(c => conceptLabel(c.key)).join(', ')}</div>` : ''}

      <h3>🛒 Sorting Shop — word meanings (level ${shop.level}/4${acc(shop)})</h3>
      ${bars(shop)}
      ${shop.weak.length ? `<div class="tip">Practise together: ${shop.weak.map(c => conceptLabel(c.key)).join(', ')}</div>` : ''}

      <h3>🔧 Sound Garage — speech sounds</h3>
      <p>${practiced.length
        ? 'Words practised: ' + practiced.slice(0, 12).map(([w, n]) => `${w} (${n}×)`).join(', ')
        : 'No words practised yet.'}</p>
      <div class="tip">${SOUND_SETS.l.tip}</div>
      <div class="tip">${SOUND_SETS.y.tip}</div>
      <div class="tip">${SOUND_SETS.zh.tip}</div>

      <h3>📖 Story Road — telling stories</h3>
      <p>Stories completed: ${Object.values(Mastery.state.storiesTold).reduce((a, b) => a + b, 0)}.
      Tip: after the game models "First… Then… Last…", pause and let Zac echo each
      sentence before recording. Expanding his sentence back to him ("Yes! The egg
      cracked open!") is great practice too.</p>`;
    grownups.classList.remove('hidden');
  }

  function bindLongPress(el, fn) {
    let timer = null;
    const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
    el.addEventListener('pointerdown', () => { clear(); timer = setTimeout(fn, 1500); });
    el.addEventListener('pointerup', clear);
    el.addEventListener('pointerleave', clear);
  }

  // ---------- wiring ----------
  document.getElementById('btn-play').addEventListener('pointerdown', () => {
    Speech.say('Welcome to Word Town!');
    show('town');
  });
  document.querySelectorAll('[data-nav]').forEach(b =>
    b.addEventListener('pointerdown', () => show(b.dataset.nav)));

  document.getElementById('delivery-repeat').addEventListener('pointerdown', () => Delivery.speakPrompt());
  document.getElementById('shop-repeat').addEventListener('pointerdown', () => Shop.speakPrompt());
  document.getElementById('story-repeat').addEventListener('pointerdown', () => Story.speakPrompt());

  bindLongPress(document.getElementById('btn-grownups'), openGrownups);
  document.getElementById('grownups-close').addEventListener('pointerdown', () => grownups.classList.add('hidden'));
  document.getElementById('grownups-reset').addEventListener('pointerdown', () => {
    if (confirm('Reset all of Word Town\'s progress?')) {
      Mastery.reset();
      updateStars();
      grownups.classList.add('hidden');
    }
  });

  Sounds.bindControls();
  Story.bindControls();
  updateStars();

  return { show, finishRound, updateStars };
})();
