// Story Road — narrative sequencing and expressive language.
// Zac orders three picture panels (guided: "What happens first?"), the game
// narrates the story with first/then/last sentences he can echo, and then he
// records himself telling it back.

const Story = (() => {
  let story = null;
  let placed = 0;       // how many panels are in slots
  let firstTry = true;

  function start() {
    // least-told stories first
    const sorted = shuffle(STORIES)
      .sort((a, b) => (Mastery.state.storiesTold[a.id] || 0) - (Mastery.state.storiesTold[b.id] || 0));
    story = sorted[0];
    placed = 0;
    firstTry = true;
    document.getElementById('story-tell').classList.add('hidden');
    document.getElementById('story-playback').classList.add('hidden');
    Recorder.clear();
    renderSlots();
    renderCards();
    setPrompt(story.title, `${story.title}! Let's make a story. What happens first? Tap the first picture.`);
    speakPrompt();
  }

  function setPrompt(text, spoken) {
    document.getElementById('story-prompt').textContent = text;
    story.spoken = spoken;
  }
  function speakPrompt() { if (story) Speech.say(story.spoken); }

  function renderSlots() {
    const el = document.getElementById('story-slots');
    el.innerHTML = '';
    const labels = ['First', 'Then', 'Last'];
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('div');
      s.className = 'story-slot';
      s.dataset.i = i;
      s.innerHTML = `<div class="slot-label">${labels[i]}</div><div class="slot-emoji"></div>`;
      el.appendChild(s);
    }
  }

  function renderCards() {
    const el = document.getElementById('story-cards');
    el.innerHTML = '';
    for (const p of shuffle(story.panels.map((panel, i) => ({ panel, i })))) {
      const c = document.createElement('button');
      c.className = 'story-card';
      c.textContent = p.panel.e;
      c.addEventListener('pointerdown', () => onCardTap(c, p.i));
      el.appendChild(c);
    }
  }

  function onCardTap(cardEl, panelIndex) {
    if (!story || placed >= 3) return;
    if (panelIndex === placed) {
      cardEl.classList.add('used');
      const slot = document.querySelectorAll('.story-slot')[placed];
      slot.classList.add('filled');
      slot.querySelector('.slot-emoji').textContent = story.panels[placed].e;
      const line = story.panels[placed].line;
      placed += 1;
      if (placed >= 3) {
        Speech.say('Yes! ' + line).then(storyComplete);
      } else {
        const ask = placed === 1 ? 'What happens next?' : 'And what happens last?';
        Speech.say(`Yes! ${line} ${ask}`);
      }
    } else {
      cardEl.classList.add('wrong');
      setTimeout(() => cardEl.classList.remove('wrong'), 450);
      firstTry = false;
      const asks = ['What happens first?', 'What happens next?', 'What happens last?'];
      Speech.say(`${tryAgain()} ${asks[placed]}`);
    }
  }

  async function storyComplete() {
    Mastery.noteStory(story.id);
    // model the full story once, slowly, so he can echo it
    await Speech.say('Great story! Listen!');
    for (const p of story.panels) {
      await Speech.say(p.line, { interrupt: false, rate: 0.8 });
    }
    document.getElementById('story-tell').classList.remove('hidden');
    setPrompt('Your turn! Tell the story!', 'Now it is your turn! Hold the microphone and tell me the story.');
    speakPrompt();
  }

  function toldIt() {
    if (!story) return;
    App.finishRound('📖', 'What a storyteller!');
    setTimeout(start, 2600);
  }

  function bindControls() {
    const mic = document.getElementById('story-mic');
    const playback = document.getElementById('story-playback');
    bindHoldToRecord(mic, playback);
    playback.addEventListener('pointerdown', () => Recorder.play());
    document.getElementById('story-done').addEventListener('pointerdown', toldIt);
  }

  return { start, speakPrompt, bindControls };
})();
