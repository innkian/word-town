// Sound Garage — articulation practice for Zac's target sounds: /l/, /y/, /zh/.
// The game models each word (normal + extra slow with the sound stretched),
// gives a kid-friendly mouth cue, and lets him hold the mic to record and
// hear himself back. A grown-up (or Zac) taps "I said it!" to fuel the car;
// five words = car wash celebration + a star.

const Sounds = (() => {
  const ROUND_LEN = 5;
  let currentSet = null;   // 'l' | 'y' | 'zh' | 'mix'
  let queue = [];
  let word = null;
  let fuelled = 0;

  function start() {
    document.getElementById('sounds-play').classList.add('hidden');
    const bays = document.getElementById('sounds-bays');
    bays.classList.remove('hidden');
    bays.innerHTML = '';
    const options = [
      { id: 'l', e: SOUND_SETS.l.e, label: 'L words' },
      { id: 'y', e: SOUND_SETS.y.e, label: 'Y words' },
      { id: 'zh', e: SOUND_SETS.zh.e, label: 'Buzzy ZH' },
      { id: 'mix', e: '🎲', label: 'Mix it up!' },
    ];
    for (const o of options) {
      const b = document.createElement('button');
      b.className = 'bay';
      b.innerHTML = `<div class="bay-emoji">${o.e}</div><div class="bay-name">${o.label}</div>`;
      b.addEventListener('pointerdown', () => pickBay(o.id));
      bays.appendChild(b);
    }
    Speech.say('Welcome to the Sound Garage! Pick a garage door.');
  }

  function pickBay(id) {
    currentSet = id;
    const words = id === 'mix'
      ? [...SOUND_SETS.l.words, ...SOUND_SETS.y.words, ...SOUND_SETS.zh.words]
      : SOUND_SETS[id].words;
    // least-practiced words first, with a little shuffle
    queue = shuffle(words)
      .sort((a, b) => (Mastery.state.soundsPracticed[a.w] || 0) - (Mastery.state.soundsPracticed[b.w] || 0))
      .slice(0, ROUND_LEN);
    fuelled = 0;
    document.getElementById('sounds-bays').classList.add('hidden');
    document.getElementById('sounds-play').classList.remove('hidden');
    renderFuel();
    if (id !== 'mix') Speech.say(SOUND_SETS[id].cue).then(nextWord);
    else nextWord();
  }

  function setFor(w) {
    for (const key of ['l', 'y', 'zh']) {
      if (SOUND_SETS[key].words.some(x => x.w === w.w)) return SOUND_SETS[key];
    }
    return SOUND_SETS.l;
  }

  function nextWord() {
    word = queue[fuelled];
    if (!word) return;
    document.getElementById('sound-emoji').textContent = word.e;
    document.getElementById('sound-word').textContent = word.w;
    document.getElementById('sound-playback').classList.add('hidden');
    Recorder.clear();
    sayWord();
  }

  function sayWord() {
    if (!word) return;
    Speech.say(`${word.w}. Your turn! Say ${word.w}.`);
  }
  function saySlowly() {
    if (!word) return;
    Speech.say(setFor(word).cue).then(() =>
      Speech.saySlow(word.slow).then(() => Speech.say(word.w + '!')));
  }

  function renderFuel() {
    const el = document.getElementById('sound-fuel');
    el.innerHTML = '';
    const car = document.createElement('span');
    car.className = 'fuel-car';
    car.textContent = '🏎️';
    el.appendChild(car);
    for (let i = 0; i < ROUND_LEN; i++) {
      const f = document.createElement('span');
      f.className = 'fuel' + (i < fuelled ? ' on' : '');
      f.textContent = '⛽';
      el.appendChild(f);
    }
  }

  function wordDone() {
    if (!word) return;
    Mastery.notePractice(word.w);
    fuelled += 1;
    renderFuel();
    if (fuelled >= ROUND_LEN) {
      Speech.say(praise() + ' The car is all fuelled up! Vroom vroom!');
      App.finishRound('🏎️💨', 'Super talking!');
      setTimeout(start, 2600);
    } else {
      Speech.say(praise()).then(nextWord);
    }
  }

  // ---- mic wiring (hold to record) ----
  function bindControls() {
    document.getElementById('sound-hear').addEventListener('pointerdown', sayWord);
    document.getElementById('sound-slow').addEventListener('pointerdown', saySlowly);
    document.getElementById('sound-done').addEventListener('pointerdown', wordDone);

    const mic = document.getElementById('sound-mic');
    const playback = document.getElementById('sound-playback');
    bindHoldToRecord(mic, playback);
    playback.addEventListener('pointerdown', () => Recorder.play());
  }

  return { start, bindControls };
})();

// Shared hold-to-record helper (also used by Story Road).
function bindHoldToRecord(micBtn, playbackBtn) {
  let recording = false;
  micBtn.addEventListener('pointerdown', async ev => {
    micBtn.setPointerCapture(ev.pointerId);
    Speech.stop();
    recording = await Recorder.start();
    if (recording) micBtn.classList.add('recording');
    else Speech.say('The microphone is not ready. Ask a grown-up to allow it!');
  });
  const stop = async () => {
    if (!recording) return;
    recording = false;
    micBtn.classList.remove('recording');
    const url = await Recorder.stop();
    if (url && playbackBtn) {
      playbackBtn.classList.remove('hidden');
      Recorder.play();   // instant replay — kids love hearing themselves
    }
  };
  micBtn.addEventListener('pointerup', stop);
  micBtn.addEventListener('pointercancel', stop);
}
