// Delivery Run — listening comprehension, mapped to the screening's
// "Concepts, Following Directions, Questions" areas.
//
// Levels (auto-adapts via Mastery):
//   1 — tap a named object, 3 choices           ("Tap the dog")
//   2 — + size concepts and who/where questions ("Tap the BIG dog", "Who is swimming?")
//   3 — + preposition drags                     ("Put the ball ON the box")
//   4 — + two-step directions                   ("First tap the dog, then tap the fish")

const Delivery = (() => {
  const ROUND_LEN = 5;
  let area, promptEl;
  let task = null;          // current task
  let roundDone = 0;        // tasks finished this run
  let firstTry = true;

  const NOUN_KEYS = OBJECTS.map(o => 'noun:' + o.id);

  function start() {
    area = document.getElementById('delivery-area');
    promptEl = document.getElementById('delivery-prompt');
    roundDone = 0;
    renderProgress();
    nextTask();
  }

  function renderProgress() {
    const el = document.getElementById('delivery-progress');
    el.innerHTML = '';
    for (let i = 0; i < ROUND_LEN; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i < roundDone ? ' on' : '');
      d.textContent = '📦';
      el.appendChild(d);
    }
  }

  function speakPrompt() {
    if (task) Speech.say(task.spoken);
  }

  // ---------- task generation ----------
  function allowedTypes() {
    const L = Mastery.levelOf('listen');
    const t = ['noun'];
    if (L >= 2) t.push('size', 'who', 'where');
    if (L >= 3) t.push('prep', 'prep');
    if (L >= 4) t.push('twostep', 'twostep');
    return t;
  }

  function nextTask() {
    firstTry = true;
    const types = allowedTypes();
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === 'noun') makeNounTask(Mastery.levelOf('listen') === 1 ? 3 : 4);
    else if (type === 'size') makeSizeTask();
    else if (type === 'who') makeWhoTask();
    else if (type === 'where') makeWhereTask();
    else if (type === 'prep') makePrepTask();
    else makeTwoStepTask();
    speakPrompt();
  }

  function setPrompt(text, spoken) {
    promptEl.textContent = text;
    task.spoken = spoken || text;
  }

  // ---- tap-the-object ----
  function makeNounTask(n) {
    const key = Mastery.pickWeak('listen', NOUN_KEYS);
    const target = OBJ_BY_ID[key.split(':')[1]];
    const others = shuffle(OBJECTS.filter(o => o.id !== target.id && o.cat !== target.cat)).slice(0, n - 1);
    task = { type: 'noun', concepts: [key], targetId: target.id };
    renderChoices(shuffle([target, ...others]).map(o => ({
      id: o.id, e: o.e, correct: o.id === target.id,
    })));
    setPrompt(`Tap the ${target.name}`, `Tap the ${target.name}.`);
  }

  // ---- big/little ----
  function makeSizeTask() {
    const size = Mastery.pickWeak('listen', ['size:big', 'size:little']).split(':')[1];
    const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    const distractor = shuffle(OBJECTS.filter(o => o.id !== obj.id))[0];
    task = { type: 'size', concepts: ['size:' + size], targetId: obj.id + ':' + size };
    const cards = shuffle([
      { id: obj.id + ':big', e: obj.e, cls: 'big-size', correct: size === 'big' },
      { id: obj.id + ':little', e: obj.e, cls: 'small-size', correct: size === 'little' },
      { id: distractor.id, e: distractor.e, correct: false },
    ]);
    renderChoices(cards);
    setPrompt(`Tap the ${size} ${obj.name}`, `Tap the ${size} ${obj.name}.`);
  }

  // ---- who is …? ----
  function makeWhoTask() {
    const acts = shuffle(ACTIONS).slice(0, 3);
    const keys = acts.map(a => 'action:' + a.id);
    const key = Mastery.pickWeak('listen', keys);
    const target = ACTIONS.find(a => 'action:' + a.id === key);
    task = { type: 'who', concepts: ['wh:who', key], targetId: target.id };
    renderChoices(shuffle(acts).map(a => ({ id: a.id, e: a.e, correct: a.id === target.id })));
    setPrompt(`Who is ${target.name}?`, `Who is ${target.name}? Tap them!`);
  }

  // ---- where …? ----
  function makeWhereTask() {
    const q = WHERE_QUESTIONS[Math.floor(Math.random() * WHERE_QUESTIONS.length)];
    task = { type: 'where', concepts: ['wh:where'], targetId: 'answer', answerWord: q.answerWord };
    const cards = shuffle([
      { id: 'answer', e: q.answer, correct: true },
      ...shuffle(q.wrong).slice(0, 3).map((e, i) => ({ id: 'w' + i, e, correct: false })),
    ]);
    renderChoices(cards);
    setPrompt(q.q, q.q);
  }

  // ---- two-step ----
  function makeTwoStepTask() {
    const pool = shuffle(OBJECTS).slice(0, 4);
    const [a, b] = shuffle(pool.slice()).slice(0, 2);
    task = {
      type: 'twostep', concepts: ['seq:two-step', 'noun:' + a.id, 'noun:' + b.id],
      steps: [a.id, b.id], stepIndex: 0,
    };
    renderChoices(pool.map(o => ({ id: o.id, e: o.e, correct: null })));
    setPrompt(`First the ${a.name}, then the ${b.name}`,
      `Listen carefully! First tap the ${a.name}. Then tap the ${b.name}.`);
  }

  // ---- put the X on/in/under/next to the box (drag) ----
  function makePrepTask() {
    const prep = Mastery.pickWeak('listen', PREPOSITIONS.map(p => 'prep:' + p)).split(':')[1];
    const obj = shuffle(OBJECTS.filter(o => ['ball', 'teddy', 'apple', 'duck', 'car', 'sock'].includes(o.id)))[0] || OBJ_BY_ID.ball;
    task = { type: 'prep', concepts: ['prep:' + prep], prep, obj };
    renderPrepScene(obj, prep);
    setPrompt(`Put the ${o_name(obj)} ${prep} the box`, `Put the ${o_name(obj)} ${prep} the box.`);
  }
  function o_name(o) { return o.name; }

  // ---------- rendering ----------
  function renderChoices(cards) {
    area.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'choice-row';
    for (const c of cards) {
      const el = document.createElement('button');
      el.className = 'choice-card' + (c.cls ? ' ' + c.cls : '');
      el.textContent = c.e;
      el.dataset.id = c.id;
      el.addEventListener('pointerdown', () => onChoiceTap(el, c));
      row.appendChild(el);
    }
    area.appendChild(row);
  }

  function onChoiceTap(el, c) {
    if (!task) return;
    if (task.type === 'twostep') return onTwoStepTap(el, c);
    if (c.correct) {
      el.classList.add('correct');
      finishTask(true);
    } else {
      el.classList.add('wrong');
      setTimeout(() => el.classList.remove('wrong'), 450);
      wrongAttempt();
    }
  }

  function onTwoStepTap(el, c) {
    const wanted = task.steps[task.stepIndex];
    if (c.id === wanted) {
      el.classList.add('correct', 'dim');
      task.stepIndex += 1;
      if (task.stepIndex >= task.steps.length) finishTask(true);
      else Speech.say('Good! Now the next one.');
    } else {
      el.classList.add('wrong');
      setTimeout(() => el.classList.remove('wrong'), 450);
      wrongAttempt();
    }
  }

  function wrongAttempt() {
    firstTry = false;
    Speech.say(tryAgain() + ' ' + task.spoken);
  }

  // ---------- preposition scene + drag ----------
  function renderPrepScene(obj, prep) {
    area.innerHTML = '';
    const scene = document.createElement('div');
    scene.className = 'prep-scene';
    const box = document.createElement('div');
    box.className = 'prep-box';
    scene.appendChild(box);
    const drag = document.createElement('div');
    drag.className = 'prep-drag';
    drag.textContent = obj.e;
    scene.appendChild(drag);
    area.appendChild(scene);

    // start position: bottom-left corner
    requestAnimationFrame(() => {
      const a = area.getBoundingClientRect();
      drag.style.left = Math.round(a.width * 0.08) + 'px';
      drag.style.top = Math.round(a.height * 0.62) + 'px';
    });

    let dragging = false;
    drag.addEventListener('pointerdown', ev => {
      dragging = true;
      drag.classList.add('dragging');
      drag.setPointerCapture(ev.pointerId);
    });
    drag.addEventListener('pointermove', ev => {
      if (!dragging) return;
      const a = area.getBoundingClientRect();
      drag.style.left = (ev.clientX - a.left - drag.offsetWidth / 2) + 'px';
      drag.style.top = (ev.clientY - a.top - drag.offsetHeight / 2) + 'px';
    });
    drag.addEventListener('pointerup', ev => {
      if (!dragging) return;
      dragging = false;
      drag.classList.remove('dragging');
      const zone = zoneAtPoint(box, ev.clientX, ev.clientY);
      if (!zone) return;                       // dropped nowhere near — ignore
      if (zone === prep) {
        finishTask(true);
      } else {
        wrongAttempt();
        showZoneHint(box, prep);
      }
    });
  }

  // Which zone (relative to the box) is this screen point in?
  function zoneAtPoint(box, x, y) {
    const b = box.getBoundingClientRect();
    const margin = b.width * 0.9;
    const inX = x > b.left && x < b.right;
    if (inX && y > b.top && y < b.bottom) return 'in';
    if (inX && y <= b.top && y > b.top - b.height * 1.1) return 'on';
    if (inX && y >= b.bottom && y < b.bottom + b.height * 0.9) return 'under';
    if (!inX && y > b.top - 20 && y < b.bottom + 40 &&
        x > b.left - margin && x < b.right + margin) return 'next to';
    return null;
  }

  function showZoneHint(box, prep) {
    const old = area.querySelector('.drop-zone.hint');
    if (old) old.remove();
    const b = box.getBoundingClientRect();
    const a = area.getBoundingClientRect();
    const z = document.createElement('div');
    z.className = 'drop-zone hint';
    const rel = { left: b.left - a.left, top: b.top - a.top, w: b.width, h: b.height };
    if (prep === 'on') Object.assign(z.style, px(rel.left, rel.top - rel.h * 0.75, rel.w, rel.h * 0.7));
    else if (prep === 'in') Object.assign(z.style, px(rel.left + 8, rel.top + 8, rel.w - 16, rel.h - 16));
    else if (prep === 'under') Object.assign(z.style, px(rel.left, rel.top + rel.h + 4, rel.w, rel.h * 0.6));
    else Object.assign(z.style, px(rel.left + rel.w + 10, rel.top, rel.w * 0.8, rel.h));
    area.firstChild.appendChild(z);
    setTimeout(() => z.remove(), 2500);
  }
  function px(l, t, w, h) { return { left: l + 'px', top: t + 'px', width: w + 'px', height: h + 'px' }; }

  // ---------- task completion ----------
  function finishTask(ok) {
    const change = Mastery.record('listen', task.concepts, firstTry);
    task = null;
    roundDone += 1;
    renderProgress();
    const done = roundDone >= ROUND_LEN;
    const after = () => {
      if (change === 'levelup') Speech.say('Wow! Level up! The deliveries are getting trickier!');
      if (done) {
        App.finishRound('🚚', 'Deliveries done!');
        roundDone = 0;
        renderProgress();
        setTimeout(nextTask, 2600);
      } else {
        setTimeout(nextTask, 350);
      }
    };
    Speech.say(praise()).then(after);
  }

  return { start, speakPrompt };
})();
