// Sorting Shop — semantics: labels & functions, categories, odd-one-out.
// (Screening: "just within" range for semantics — build vocabulary connections.)
//
// Levels:
//   1 — function questions, 3 pictures       ("Which one do we drink from?")
//   2 — + category sorting into two baskets  ("Where does the apple go?")
//   3 — + odd-one-out                        ("Which one does not belong?")
//   4 — bigger sets of everything

const Shop = (() => {
  const ROUND_LEN = 5;
  let area, promptEl;
  let task = null;
  let lastSpoken = '';      // kept so the 🔊 button works between tasks too
  let roundDone = 0;
  let firstTry = true;

  function start() {
    area = document.getElementById('shop-area');
    promptEl = document.getElementById('shop-prompt');
    roundDone = 0;
    renderProgress();
    nextTask();
  }

  function renderProgress() {
    const el = document.getElementById('shop-progress');
    el.innerHTML = '';
    for (let i = 0; i < ROUND_LEN; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i < roundDone ? ' on' : '');
      d.textContent = '🛒';
      el.appendChild(d);
    }
  }

  function speakPrompt() { Speech.say(task ? task.spoken : lastSpoken); }

  function nextTask() {
    firstTry = true;
    const L = Mastery.levelOf('shop');
    const types = ['fn'];
    if (L >= 2) types.push('cat', 'cat');
    if (L >= 3) types.push('odd', 'odd');
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === 'fn') makeFunctionTask(L >= 4 ? 4 : 3);
    else if (type === 'cat') makeCategoryTask();
    else makeOddTask(L >= 4 ? 5 : 4);
    speakPrompt();
  }

  function setPrompt(text, spoken) {
    promptEl.textContent = text;
    task.spoken = spoken || text;
    lastSpoken = task.spoken;
  }

  // ---- which one do we use to …? ----
  function makeFunctionTask(n) {
    const keys = FUNCTIONS.map(f => 'fn:' + f.id);
    const key = Mastery.pickWeak('shop', keys);
    const fn = FUNCTIONS.find(f => 'fn:' + f.id === key);
    const distractors = shuffle(FUNCTION_DISTRACTORS.filter(e => e !== fn.e)).slice(0, n - 1);
    task = { type: 'fn', concepts: [key], answerName: fn.name };
    renderChoices(shuffle([
      { id: 'answer', e: fn.e, correct: true },
      ...distractors.map((e, i) => ({ id: 'd' + i, e, correct: false })),
    ]));
    setPrompt(fn.q, fn.q);
  }

  // ---- which basket does this go in? ----
  function makeCategoryTask() {
    const catKeys = Object.keys(CATEGORIES).map(c => 'cat:' + c);
    const key = Mastery.pickWeak('shop', catKeys);
    const cat = key.split(':')[1];
    const item = shuffle(OBJECTS.filter(o => o.cat === cat))[0];
    const otherCat = shuffle(Object.keys(CATEGORIES).filter(c => c !== cat))[0];
    task = { type: 'cat', concepts: [key], answerCat: cat };

    area.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'basket-row';
    const baskets = shuffle([cat, otherCat]);
    const mkBasket = c => {
      const b = document.createElement('button');
      b.className = 'basket';
      b.innerHTML = `<div class="basket-emoji">🧺</div><div class="basket-emoji">${CATEGORIES[c].e}</div><div class="basket-label">${CATEGORIES[c].label}</div>`;
      b.addEventListener('pointerdown', () => {
        if (!task) return;
        if (c === cat) { b.classList.add('correct'); finishTask(); }
        else {
          b.classList.add('wrong');
          setTimeout(() => b.classList.remove('wrong'), 450);
          firstTry = false;
          const isAre = item.pl ? `Are ${item.name}` : `Is a ${item.name}`;
          Speech.say(`${tryAgain()} ${isAre} ${labelFor(cat)} or ${labelFor(otherCat)}?`);
        }
      });
      return b;
    };
    row.appendChild(mkBasket(baskets[0]));
    const itemEl = document.createElement('div');
    itemEl.className = 'sort-item';
    itemEl.innerHTML = `<div>${item.e}</div><div class="caption">${item.name}</div>`;
    row.appendChild(itemEl);
    row.appendChild(mkBasket(baskets[1]));
    area.appendChild(row);

    setPrompt(`Where ${item.pl ? 'do' : 'does'} the ${item.name} go?`,
      `${item.pl ? 'Here are some' : 'Here is a'} ${item.name}. Which basket ${item.pl ? 'do they' : 'does it'} go in? ${labelFor(baskets[0])}, or ${labelFor(baskets[1])}?`);
  }
  function labelFor(c) { return CATEGORIES[c].label.toLowerCase(); }

  // ---- odd one out ----
  function makeOddTask(n) {
    const cats = shuffle(Object.keys(CATEGORIES));
    const mainCat = cats[0], oddCat = cats[1];
    const mains = shuffle(OBJECTS.filter(o => o.cat === mainCat)).slice(0, n - 1);
    const odd = shuffle(OBJECTS.filter(o => o.cat === oddCat))[0];
    task = {
      type: 'odd', concepts: ['odd:odd-one-out', 'cat:' + mainCat],
      explain: `Yes! The ${odd.name} ${odd.pl ? 'do' : 'does'} not belong. ` +
        `The others are all ${labelFor(mainCat)}, but the ${odd.name} ${odd.pl ? 'are' : 'is'} ${odd.pl ? labelFor(oddCat) : aCatWord(oddCat)}!`,
    };
    renderChoices(shuffle([
      { id: 'odd', e: odd.e, correct: true },
      ...mains.map((o, i) => ({ id: 'm' + i, e: o.e, correct: false })),
    ]));
    setPrompt('Which one does not belong?', 'Look at all the pictures. Which one does not belong? Tap the odd one out!');
  }
  function aCatWord(c) {
    return { animals: 'an animal', food: 'food', vehicles: 'a vehicle', clothes: 'clothes', toys: 'a toy' }[c];
  }

  // ---------- shared ----------
  function renderChoices(cards) {
    area.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'choice-row';
    for (const c of cards) {
      const el = document.createElement('button');
      el.className = 'choice-card';
      el.textContent = c.e;
      el.addEventListener('pointerdown', () => {
        if (!task) return;
        if (c.correct) { el.classList.add('correct'); finishTask(); }
        else {
          el.classList.add('wrong');
          setTimeout(() => el.classList.remove('wrong'), 450);
          firstTry = false;
          Speech.say(tryAgain() + ' ' + task.spoken);
        }
      });
      row.appendChild(el);
    }
    area.appendChild(row);
  }

  function finishTask() {
    const explain = task.explain;
    const change = Mastery.record('shop', task.concepts, firstTry);
    task = null;
    roundDone += 1;
    renderProgress();
    const done = roundDone >= ROUND_LEN;
    Speech.say(explain || praise()).then(() => {
      if (change === 'levelup') Speech.say('Level up! The shop is getting busier!');
      if (done) {
        App.finishRound('🛒', 'Shopping done!');
        roundDone = 0;
        renderProgress();
        setTimeout(nextTask, 2600);
      } else {
        setTimeout(nextTask, 350);
      }
    });
  }

  return { start, speakPrompt };
})();
