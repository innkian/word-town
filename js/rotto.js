// Rottnest Rangers — listening comprehension (receptive language) with Quin the
// quokka, set on Rottnest Island among Australian bush animals and birds.
//
// Four activities, each its own adaptive skill (levels 1–4, via Mastery):
//   📖 Quin's Stories  — hear a short story, answer who/what/where → when/how → why/feel/next
//   🔍 Find It!        — 1 → 2 → 3 critical elements, "more/fewer/most/no", and "NOT"
//   🧭 Ranger Says     — on/in front/next to/behind/between, first-then, before/after, 3 steps
//   🤔 Silly or Sensible? — yes/no reasoning, plus the real Rottnest ranger rules

const Rotto = (() => {
  const ROUND_LEN = 5;
  const SKILL = { story: 'rstory', find: 'rfind', dirs: 'rdirs', silly: 'rsilly' };

  // ---------- Quin the quokka (no emoji exists, so she is drawn) ----------
  const QUOKKA = `<svg class="qsvg" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="22" cy="30" r="11" fill="#a47548"/><circle cx="78" cy="30" r="11" fill="#a47548"/>
    <circle cx="22" cy="30" r="5.5" fill="#d9a98a"/><circle cx="78" cy="30" r="5.5" fill="#d9a98a"/>
    <ellipse cx="50" cy="56" rx="36" ry="36" fill="#b98b5e"/>
    <ellipse cx="50" cy="66" rx="21" ry="16" fill="#ecd5b0"/>
    <circle cx="37" cy="48" r="5" fill="#2b1b10"/><circle cx="63" cy="48" r="5" fill="#2b1b10"/>
    <circle cx="38.8" cy="46.2" r="1.7" fill="#fff"/><circle cx="64.8" cy="46.2" r="1.7" fill="#fff"/>
    <ellipse cx="50" cy="59" rx="7" ry="4.6" fill="#3b2418"/>
    <path d="M35 68 Q50 83 65 68" fill="none" stroke="#3b2418" stroke-width="3.4" stroke-linecap="round"/>
  </svg>`;

  // ---------- the bush and island animals ----------
  const A = {
    quokka:     { h: QUOKKA, name: 'quokka',     pl: 'quokkas',     g: 'land' },
    kangaroo:   { e: '🦘',  name: 'kangaroo',    pl: 'kangaroos',   g: 'land' },
    koala:      { e: '🐨',  name: 'koala',       pl: 'koalas',      g: 'land' },
    lizard:     { e: '🦎',  name: 'lizard',      pl: 'lizards',     g: 'land' },
    snake:      { e: '🐍',  name: 'snake',       pl: 'snakes',      g: 'land' },
    parrot:     { e: '🦜',  name: 'parrot',      pl: 'parrots',     g: 'bird' },
    owl:        { e: '🦉',  name: 'owl',         pl: 'owls',        g: 'bird' },
    eagle:      { e: '🦅',  name: 'eagle',       pl: 'eagles',      g: 'bird' },
    penguin:    { e: '🐧',  name: 'penguin',     pl: 'penguins',    g: 'bird' },
    kookaburra: { e: '🐦',  name: 'kookaburra',  pl: 'kookaburras', g: 'bird' },
    dolphin:    { e: '🐬',  name: 'dolphin',     pl: 'dolphins',    g: 'sea' },
    turtle:     { e: '🐢',  name: 'turtle',      pl: 'turtles',     g: 'sea' },
    seal:       { e: '🦭',  name: 'seal',        pl: 'seals',       g: 'sea' },
    fish:       { e: '🐟',  name: 'fish',        pl: 'fish',        g: 'sea' },
    crab:       { e: '🦀',  name: 'crab',        pl: 'crabs',       g: 'sea' },
    bee:        { e: '🐝',  name: 'bee',         pl: 'bees',        g: 'bug' },
    butterfly:  { e: '🦋',  name: 'butterfly',   pl: 'butterflies', g: 'bug' },
  };
  const IDS = Object.keys(A);
  const icon = x => (A[x] ? (A[x].h || A[x].e) : x);
  const G = g => IDS.filter(i => A[i].g === g);
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const lvl = m => Mastery.levelOf(SKILL[m]);

  // ---------- stories ----------
  // t = question type. Levels: who/what/where (1) · when/how (2) · why/feel/next (3+)
  const T_LEVEL = { who: 1, what: 1, where: 1, when: 2, how: 2, why: 3, feel: 3, next: 3 };
  const STORIES = [
    { id: 'quin-beach', scene: ['quokka', '🏖️', '🌊'],
      text: 'Quin the quokka hopped down to the beach. She saw a big wave coming. Quin ran back to her mum!',
      qs: [
        { t: 'who', q: 'Who hopped down to the beach?', a: 'quokka', w: ['koala', 'kangaroo', 'parrot'], say: 'Quin the quokka did!' },
        { t: 'what', q: 'What did Quin see?', a: '🌊', w: ['🌈', '🚲', '🍎'], say: 'A big wave!' },
        { t: 'feel', q: 'How did Quin feel when she saw the big wave?', a: '😨', w: ['😴', '😄', '😋'], say: 'She felt scared, so she ran to her mum.' },
      ] },
    { id: 'penguin', scene: ['penguin', '🌊', '🐟'],
      text: 'A little penguin swam in the sea. He was very hungry. He caught a silver fish and ate it for dinner.',
      qs: [
        { t: 'who', q: 'Who swam in the sea?', a: 'penguin', w: ['kangaroo', 'koala', 'lizard'], say: 'The little penguin!' },
        { t: 'what', q: 'What did the penguin catch?', a: '🐟', w: ['🍌', '🍕', '🍦'], say: 'A silver fish!' },
        { t: 'why', q: 'Why did the penguin catch a fish?', a: '🍽️', w: ['🎈', '🛏️', '🚲'], say: 'Because he was hungry!' },
      ] },
    { id: 'bikes', scene: ['🚲', '☀️', '🍦'],
      text: 'Dad and Mia rode their bikes around Rottnest Island. It was a hot, sunny day. They stopped to eat an ice cream.',
      qs: [
        { t: 'how', q: 'How did they get around the island?', a: '🚲', w: ['🚗', '✈️', '🚂'], say: 'On their bikes!' },
        { t: 'what', q: 'What was the weather like?', a: '☀️', w: ['🌧️', '❄️', '🌪️'], say: 'Hot and sunny!' },
        { t: 'what', q: 'What did they stop to eat?', a: '🍦', w: ['🍕', '🍞', '🥕'], say: 'An ice cream!' },
      ] },
    { id: 'kookaburra', scene: ['kookaburra', '🌳', 'koala'],
      text: 'The kookaburra sat in the gum tree. He laughed, ha ha ha! The sleepy koala woke up and yawned.',
      qs: [
        { t: 'where', q: 'Where did the kookaburra sit?', a: '🌳', w: ['🌊', '🏠', '🪨'], say: 'In the gum tree!' },
        { t: 'who', q: 'Who woke up?', a: 'koala', w: ['owl', 'snake', 'turtle'], say: 'The sleepy koala!' },
        { t: 'why', q: 'What woke the koala up?', a: 'kookaburra', w: ['🌧️', '🚒', 'kangaroo'], say: 'The kookaburra laughed and woke him up!' },
      ] },
    { id: 'ferry', scene: ['⛴️', 'dolphin', '😄'],
      text: 'The ferry sailed across the blue water to the island. Max saw a dolphin jump out of the waves. He clapped his hands and cheered!',
      qs: [
        { t: 'what', q: 'What sailed across the water?', a: '⛴️', w: ['🚌', '✈️', '🚂'], say: 'The ferry!' },
        { t: 'who', q: 'What animal did Max see?', a: 'dolphin', w: ['kangaroo', 'owl', 'koala'], say: 'A dolphin!' },
        { t: 'feel', q: 'How did Max feel?', a: '😄', w: ['😢', '😠', '😴'], say: 'Happy! He cheered.' },
      ] },
    { id: 'rain', scene: ['🌧️', 'kangaroo', '🌳'],
      text: 'Dark clouds came over the island. Rain began to fall. The kangaroo hid under a tree to stay dry.',
      qs: [
        { t: 'who', q: 'Who hid under the tree?', a: 'kangaroo', w: ['dolphin', 'penguin', 'turtle'], say: 'The kangaroo!' },
        { t: 'what', q: 'What fell from the clouds?', a: '🌧️', w: ['❄️', '🍎', '⭐'], say: 'Rain!' },
        { t: 'why', q: 'Why did the kangaroo hide under the tree?', a: '☂️', w: ['🍎', '🎈', '🏖️'], say: 'To stay dry!' },
        { t: 'next', q: 'What might we see in the sky after the rain?', a: '🌈', w: ['🌙', '⛄', '🎆'], say: 'A rainbow!' },
      ] },
    { id: 'lighthouse', scene: ['🗼', '🌙', 'owl'],
      text: 'At night, the lighthouse turns on its big light. The light helps the boats find their way home. An owl hoots from the very top.',
      qs: [
        { t: 'when', q: 'When does the lighthouse turn on its light?', a: '🌙', w: ['☀️', '🌤️', '🌈'], say: 'At night!' },
        { t: 'who', q: 'Who hoots at the top?', a: 'owl', w: ['parrot', 'crab', 'koala'], say: 'The owl!' },
        { t: 'why', q: 'Why does the lighthouse have a big light?', a: '⛵', w: ['🎂', '🏖️', 'kangaroo'], say: 'To help the boats find their way home!' },
      ] },
    { id: 'snorkel', scene: ['🤿', '🌊', 'turtle'],
      text: 'Dad put on a mask and a snorkel. He swam in the clear water at the Basin. He saw a turtle with a big shell.',
      qs: [
        { t: 'what', q: 'What did Dad put on?', a: '🤿', w: ['🧢', '🧤', '👟'], say: 'A mask and snorkel!' },
        { t: 'where', q: 'Where did Dad swim?', a: '🌊', w: ['🛏️', '🚌', '🌳'], say: 'In the clear water!' },
        { t: 'who', q: 'Which animal did Dad see?', a: 'turtle', w: ['kangaroo', 'owl', 'koala'], say: 'A turtle with a big shell!' },
      ] },
    { id: 'joey', scene: ['kangaroo', '👜', '🌿'],
      text: "A baby kangaroo is called a joey. The joey hides in its mum's pouch. When it gets big, it hops out to play.",
      qs: [
        { t: 'who', q: "Who hides in its mum's pouch?", a: 'kangaroo', w: ['koala', 'parrot', 'penguin'], say: 'The baby kangaroo, called a joey!' },
        { t: 'where', q: 'Where does the joey hide?', a: '👜', w: ['🌳', '🏖️', '🪨'], say: "In its mum's pouch!" },
        { t: 'when', q: 'When does the joey hop out to play?', a: '🦘', w: ['🥚', '🍼', '🛏️'], say: 'When it gets big!' },
      ] },
    { id: 'bee', scene: ['bee', '🌸', '🍯'],
      text: 'A bee buzzed around the wildflowers. Then she flew back to the hive. Soon there was yummy honey!',
      qs: [
        { t: 'who', q: 'Who buzzed around the flowers?', a: 'bee', w: ['koala', 'lizard', 'crab'], say: 'The bee!' },
        { t: 'where', q: 'Where did the bee fly back to?', a: '🏠', w: ['🌊', '🏖️', '⛵'], say: 'Back to the hive, her home!' },
        { t: 'what', q: 'What was made at the hive?', a: '🍯', w: ['🍕', '🍦', '🍞'], say: 'Yummy honey!' },
      ] },
    { id: 'sandcastle', scene: ['🏰', '🌊', '😢'],
      text: 'Max built a tall sandcastle on the beach. A wave came and washed it away. Max felt sad. Then he built a new one.',
      qs: [
        { t: 'what', q: 'What washed the sandcastle away?', a: '🌊', w: ['🌬️', '🚲', 'kangaroo'], say: 'A wave!' },
        { t: 'feel', q: 'How did Max feel?', a: '😢', w: ['😄', '😴', '😠'], say: 'Sad, because his castle was gone.' },
        { t: 'next', q: 'What did Max do next?', a: '🏰', w: ['🛏️', '🍕', '🚌'], say: 'He built a new sandcastle!' },
      ] },
    { id: 'ranger', scene: ['🧑‍✈️', 'quokka', '🍃'],
      text: 'Ranger Jo said, please do not feed the quokkas. They like to eat green leaves. Our food can make them sick.',
      qs: [
        { t: 'what', q: 'What do quokkas like to eat?', a: '🍃', w: ['🍕', '🍟', '🍬'], say: 'Green leaves!' },
        { t: 'why', q: 'Why should we not feed the quokkas?', a: '🤒', w: ['😄', '🎉', '😴'], say: 'Our food can make them sick!' },
      ] },
  ];

  // ---------- yes / no reasoning ----------
  // k: fact | reason | rule   (lvl = lowest level that can ask it)
  const YN = [
    { lvl: 1, k: 'fact', q: 'Do kangaroos hop?', yes: true, pics: ['kangaroo'], why: 'Yes! Kangaroos hop on their big back legs.' },
    { lvl: 1, k: 'fact', q: 'Can a quokka drive a bus?', yes: false, pics: ['quokka', '🚌'], why: 'No! Quokkas cannot drive. They hop and munch leaves.' },
    { lvl: 1, k: 'fact', q: 'Do penguins swim in the sea?', yes: true, pics: ['penguin', '🌊'], why: 'Yes! Penguins are great swimmers.' },
    { lvl: 1, k: 'fact', q: 'Do fish live up in a tree?', yes: false, pics: ['fish', '🌳'], why: 'No! Fish live in the water.' },
    { lvl: 1, k: 'fact', q: 'Can a koala fly like a bird?', yes: false, pics: ['koala', '☁️'], why: 'No! Koalas climb trees. Birds fly.' },
    { lvl: 1, k: 'fact', q: 'Do bees make honey?', yes: true, pics: ['bee', '🍯'], why: 'Yes! Bees make yummy honey.' },
    { lvl: 1, k: 'fact', q: 'Does a boat float on the water?', yes: true, pics: ['⛵', '🌊'], why: 'Yes! Boats float on the water.' },
    { lvl: 1, k: 'fact', q: 'Do people ride bikes on Rottnest Island?', yes: true, pics: ['🚲', '🏝️'], why: 'Yes! Lots of people ride bikes around Rottnest Island.' },
    { lvl: 1, k: 'fact', q: 'Do parrots have colourful feathers?', yes: true, pics: ['parrot'], why: 'Yes! Parrots have bright, colourful feathers.' },
    { lvl: 2, k: 'fact', q: 'Is a quokka bigger than an elephant?', yes: false, pics: ['quokka', '🐘'], why: 'No! A quokka is small, about as big as a cat.' },
    { lvl: 2, k: 'fact', q: 'Can a snake wear thongs?', yes: false, pics: ['snake', '🩴'], why: 'No! Snakes have no feet.' },
    { lvl: 2, k: 'fact', q: 'Do owls come out at night?', yes: true, pics: ['owl', '🌙'], why: 'Yes! Owls are awake at night.' },
    { lvl: 2, k: 'fact', q: 'Does a turtle carry its home on its back?', yes: true, pics: ['turtle'], why: 'Yes! A turtle has a hard shell on its back.' },
    { lvl: 2, k: 'fact', q: 'Do mum kangaroos carry their babies in a pouch?', yes: true, pics: ['kangaroo', '👜'], why: 'Yes! Baby kangaroos are called joeys. They ride in the pouch.' },
    { lvl: 2, k: 'fact', q: 'Is the sea dry?', yes: false, pics: ['🌊', '🏜️'], why: 'No! The sea is wet and full of water.' },
    { lvl: 2, k: 'fact', q: 'Does the lighthouse help boats at night?', yes: true, pics: ['🗼', '⛵'], why: 'Yes! Its light helps boats find their way.' },
    { lvl: 2, k: 'reason', q: 'Do we put on sunscreen to stop sunburn?', yes: true, pics: ['🧴', '☀️'], why: 'Yes! Sunscreen protects our skin from the sun.' },
    { lvl: 2, k: 'reason', q: 'Do we wear a hat to keep the sun off our face?', yes: true, pics: ['🧢', '☀️'], why: 'Yes! A hat gives us shade.' },
    { lvl: 3, k: 'reason', q: 'It is a very hot day. Is it sensible to wear a big warm jumper?', yes: false, pics: ['🧥', '🥵'], why: 'No! A jumper would make us too hot. A hat and a t-shirt are better.' },
    { lvl: 3, k: 'reason', q: 'It is raining. Is it sensible to take an umbrella?', yes: true, pics: ['☂️', '🌧️'], why: 'Yes! An umbrella keeps us dry.' },
    { lvl: 3, k: 'reason', q: 'The koala is fast asleep. Should we shout very loudly?', yes: false, pics: ['koala', '💤'], why: 'No! We should be quiet so he can sleep.' },
    { lvl: 3, k: 'reason', q: 'The waves are huge and scary. Is it safe to swim?', yes: false, pics: ['🌊', '😨'], why: 'No! Big waves are not safe. We should stay on the sand.' },
    { lvl: 3, k: 'reason', q: 'You feel hungry. Is it sensible to eat your lunch?', yes: true, pics: ['😋', '🥪'], why: 'Yes! Food helps our tummy feel full.' },
    { lvl: 2, k: 'rule', q: 'Rottnest rangers say: is it okay to feed the quokkas our sandwich?', yes: false, pics: ['quokka', '🥪'], why: 'No! Our food can make quokkas sick. They eat leaves.' },
    { lvl: 2, k: 'rule', q: 'Is it okay to pat a wild quokka?', yes: false, pics: ['quokka', '✋'], why: 'No! Quokkas are wild. We look with our eyes and keep our hands to ourselves.' },
    { lvl: 3, k: 'rule', q: 'Is it kind to take a photo of a quokka from a little way back?', yes: true, pics: ['quokka', '📸'], why: 'Yes! Photos are great. We stay back and give the quokka space.' },
    { lvl: 3, k: 'rule', q: 'Should we put our rubbish in the bin on the island?', yes: true, pics: ['🗑️', '🏝️'], why: 'Yes! The bin keeps the island clean for the animals.' },
  ];

  // ---------- state ----------
  let root, hub, play, area, promptEl, storyBtn, progressEl;
  let mode = null, task = null, firstTry = true, wrongCount = 0, roundDone = 0;
  let lastSay = '';
  let cur = null;              // current story + remaining questions
  const recentStories = [];
  const recentYN = [];

  // ---------- helpers ----------
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const uniq = arr => [...new Set(arr)];

  function start() {
    root = document.getElementById('screen-rotto');
    hub = document.getElementById('rotto-hub');
    play = document.getElementById('rotto-play');
    area = document.getElementById('rotto-area');
    promptEl = document.getElementById('rotto-prompt');
    storyBtn = document.getElementById('rotto-story-btn');
    progressEl = document.getElementById('rotto-progress');
    showHub();
  }

  function showHub() {
    Speech.stop();
    task = null; mode = null;
    play.classList.add('hidden');
    hub.classList.remove('hidden');
    hub.innerHTML = '';
    const bays = [
      { m: 'story', e: icon('quokka'), label: "Quin's Stories" },
      { m: 'find',  e: '🔍', label: 'Find It!' },
      { m: 'dirs',  e: '🧭', label: 'Ranger Says' },
      { m: 'silly', e: '🤔', label: 'Silly or Sensible?' },
    ];
    for (const b of bays) {
      const d = el('button', 'bay', `<div class="bay-emoji">${b.e}</div><div class="bay-name">${b.label}</div>`);
      d.addEventListener('pointerdown', () => pickMode(b.m));
      hub.appendChild(d);
    }
    Speech.say("Welcome to Rottnest Island! I'm Quin the quokka. What shall we do today?");
  }

  function pickMode(m) {
    mode = m;
    hub.classList.add('hidden');
    play.classList.remove('hidden');
    storyBtn.classList.toggle('hidden', m !== 'story');
    cur = null;
    roundDone = 0;
    renderProgress();
    nextTask();
  }

  function renderProgress() {
    progressEl.innerHTML = '';
    for (let i = 0; i < ROUND_LEN; i++) {
      progressEl.appendChild(el('span', 'dot' + (i < roundDone ? ' on' : ''), '🐾'));
    }
  }

  function setTask(t, promptText, spoken) {
    task = Object.assign({ locked: false }, t);
    firstTry = true; wrongCount = 0;
    promptEl.textContent = promptText;
    task.say = spoken || promptText;
    lastSay = task.say;
  }

  function speakPrompt() { Speech.say(task ? task.say : lastSay); }
  function speakStory() { if (task && task.story) Speech.say(task.story); }

  function nextTask() {
    if (mode === 'story') return storyTask();
    if (mode === 'find') { findTask(); return speakPrompt(); }
    if (mode === 'dirs') { dirsTask(); return speakPrompt(); }
    if (mode === 'silly') return sillyTask();
  }

  // ---------- generic card row ----------
  function renderCards(cards, extraCls) {
    const row = el('div', 'rcards ' + (extraCls || ''));
    for (const c of cards) {
      const b = el('button', 'choice-card rcard ' + (c.cls || ''), c.html);
      if (c.style) b.setAttribute('style', c.style);
      b.dataset.id = c.id;
      c.node = b;
      b.addEventListener('pointerdown', () => onPick(b, c));
      row.appendChild(b);
    }
    task.cards = cards;
    return row;
  }

  function onPick(node, c) {
    if (!task || task.locked) return;
    if (task.seq) return onSeqPick(node, c);
    if (c.correct) {
      node.classList.add('correct');
      finish(task.extra);
    } else {
      wrong(node);
    }
  }

  function onSeqPick(node, c) {
    const want = task.seq[task.step];
    if (c.id === want) {
      node.classList.add('correct', 'dim');
      task.step += 1;
      wrongCount = 0;
      if (task.step >= task.seq.length) finish();
      else Speech.say(task.step === 1 ? 'Good! Now the next one.' : 'Good! Keep going.');
    } else {
      wrong(node, want);
    }
  }

  function wrong(node, wantId) {
    node.classList.add('wrong');
    setTimeout(() => node.classList.remove('wrong'), 450);
    firstTry = false;
    wrongCount += 1;
    // after two misses, gently show the answer so he is never stuck
    if (wrongCount >= 2 && task.cards) {
      const right = task.cards.find(c => (wantId ? c.id === wantId : c.correct));
      if (right && right.node) right.node.classList.add('hint');
    }
    Speech.say(tryAgain() + ' ' + task.say);
  }

  function finish(extra) {
    task.locked = true;
    const t = task;
    const change = Mastery.record(SKILL[mode], t.concepts, firstTry, 4);
    roundDone += 1;
    renderProgress();
    const done = roundDone >= ROUND_LEN;
    const after = () => {
      if (change === 'levelup') Speech.say("Wow! Level up! The ranger jobs are getting trickier!");
      if (done) {
        App.finishRound('🦘', 'Great ranger work!');
        roundDone = 0;
        renderProgress();
        setTimeout(nextTask, 2600);
      } else {
        setTimeout(nextTask, 350);
      }
    };
    Speech.say(praise() + (extra ? ' ' + extra : '')).then(after);
  }

  // =====================================================================
  //  📖 Quin's Stories
  // =====================================================================
  function allowedTypes() {
    const L = lvl('story');
    return Object.keys(T_LEVEL).filter(t => T_LEVEL[t] <= L);
  }

  function pickStory() {
    const L = lvl('story');
    const ok = allowedTypes();
    const pool = STORIES.filter(s => s.qs.some(q => ok.includes(q.t)));
    let cand = pool.filter(s => !recentStories.includes(s.id));
    if (!cand.length) cand = pool;
    const s = rnd(cand);
    recentStories.push(s.id);
    if (recentStories.length > 4) recentStories.shift();
    const qs = shuffle(s.qs.filter(q => ok.includes(q.t))).slice(0, L >= 3 ? 3 : 2);
    return { story: s, qs, i: 0, fresh: true };
  }

  function storyTask() {
    if (!cur || cur.i >= cur.qs.length) cur = pickStory();
    const L = lvl('story');
    const q = cur.qs[cur.i++];
    const wrongN = L >= 3 ? 3 : 2;
    const cards = shuffle([
      { id: 'a', html: icon(q.a), correct: true },
      ...shuffle(q.w).slice(0, wrongN).map((w, i) => ({ id: 'w' + i, html: icon(w), correct: false })),
    ]);
    area.innerHTML = '';
    // pictures help at the early levels; from level 3 he must hold the story in his head
    const strip = el('div', 'story-strip' + (L >= 3 ? ' ears' : ''),
      L >= 3 ? '👂' : cur.story.scene.map(s => `<span>${icon(s)}</span>`).join(''));
    area.appendChild(strip);
    setTask({ concepts: ['story:' + q.t], extra: q.say, story: cur.story.text }, q.q);
    area.appendChild(renderCards(cards));
    if (cur.fresh) {
      cur.fresh = false;
      Speech.say(cur.story.text).then(() => { if (task && !task.locked) Speech.say(q.q); });
    } else {
      Speech.say(q.q);
    }
  }

  // =====================================================================
  //  🔍 Find It!
  // =====================================================================
  const COLOURS = [
    { id: 'red', bg: '#ffb3ae' }, { id: 'blue', bg: '#a9c8ff' },
    { id: 'yellow', bg: '#ffe58a' }, { id: 'green', bg: '#b6e8a0' },
  ];
  const COL = Object.fromEntries(COLOURS.map(c => [c.id, c]));

  function findTask() {
    const L = lvl('find');
    const bag = L === 1 ? ['name']
      : L === 2 ? ['name', 'attr2', 'attr2', 'qty2']
      : L === 3 ? ['attr2', 'attr3', 'qty2', 'qty3', 'neg']
      : ['attr3', 'attr3', 'qty3', 'neg', 'neg'];
    const t = rnd(bag);
    area.innerHTML = '';
    if (t === 'name') return findName(L === 1 ? 3 : 4);
    if (t === 'attr2') return findAttr(false);
    if (t === 'attr3') return findAttr(true);
    if (t === 'qty2') return findQty(2);
    if (t === 'qty3') return findQty(3);
    return findNeg();
  }

  function animalCard(id, { size = 'big', col = null } = {}) {
    return {
      html: `<span class="a-${size}">${icon(id)}</span>`,
      style: col ? `background:${COL[col].bg}` : '',
    };
  }

  function findName(n) {
    const key = Mastery.pickWeak('rfind', IDS.map(i => 'animal:' + i));
    const id = key.split(':')[1];
    const others = shuffle(IDS.filter(i => i !== id && A[i].g !== A[id].g)).slice(0, n - 1);
    const cards = shuffle([id, ...others]).map(i => ({ id: i, html: icon(i), correct: i === id }));
    setTask({ concepts: [key] }, `Tap the ${A[id].name}`, `Tap the ${A[id].name}.`);
    area.appendChild(renderCards(cards));
  }

  // one, two or three critical elements — each distractor differs by exactly one
  function findAttr(three) {
    const id = rnd(IDS.filter(i => A[i].g !== 'bug'));
    const other = rnd(IDS.filter(i => i !== id && A[i].g !== 'bug'));
    const cols = shuffle(COLOURS.map(c => c.id));
    const S = rnd(['big', 'little']), S2 = S === 'big' ? 'little' : 'big';
    let items, text, concepts;
    if (three) {
      const C = cols[0], C2 = cols[1];
      items = [
        { a: id, size: S, col: C, ok: true },
        { a: id, size: S2, col: C },
        { a: id, size: S, col: C2 },
        { a: other, size: S, col: C },
      ];
      text = `Tap the ${S} ${A[id].name} on the ${C} card`;
      concepts = ['find:three', 'animal:' + id];
    } else if (Math.random() < 0.5) {
      items = [{ a: id, size: S, ok: true }, { a: id, size: S2 }, { a: other, size: S }];
      text = `Tap the ${S} ${A[id].name}`;
      concepts = ['find:size', 'animal:' + id];
    } else {
      const C = cols[0], C2 = cols[1], C3 = cols[2];
      items = [{ a: id, size: 'big', col: C, ok: true }, { a: id, size: 'big', col: C2 }, { a: other, size: 'big', col: C }, { a: other, size: 'big', col: C3 }].slice(0, 3);
      text = `Tap the ${A[id].name} on the ${C} card`;
      concepts = ['find:colour', 'animal:' + id];
    }
    const cards = shuffle(items).map((it, i) =>
      Object.assign({ id: 'c' + i, correct: !!it.ok }, animalCard(it.a, { size: it.size, col: it.col })));
    setTask({ concepts }, text, text + '.');
    area.appendChild(renderCards(cards, 'tight'));
  }

  // more / fewer / most / fewest / no
  function findQty(n) {
    const id = rnd(IDS);
    const nm = A[id].pl;
    let counts, word, text, key;
    if (n === 2) {
      let a, b;
      do { a = 1 + Math.floor(Math.random() * 6); b = 1 + Math.floor(Math.random() * 6); } while (Math.abs(a - b) < 2);
      counts = [a, b];
      word = rnd(['more', 'fewer']);
      text = `Which rock has ${word} ${nm}?`;
      key = 'find:' + word;
    } else {
      const pool = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
      word = rnd(['most', 'fewest', 'none']);
      if (word === 'none') { pool[0] = 0; counts = pool; text = `Which rock has no ${nm}?`; }
      else { counts = pool; text = `Which rock has the ${word} ${nm}?`; }
      key = 'find:' + word;
    }
    const target = word === 'more' || word === 'most' ? Math.max(...counts)
      : word === 'none' ? 0 : Math.min(...counts);
    const cards = shuffle(counts.map((c, i) => ({
      id: 'q' + i, correct: c === target, cls: 'qty',
      html: c === 0 ? '<span class="rock-empty">🪨</span>'
        : `<span class="qcount">${Array.from({ length: c }, () => `<i>${icon(id)}</i>`).join('')}</span>`,
    })));
    setTask({ concepts: [key, 'animal:' + id] }, text, text);
    area.appendChild(renderCards(cards, 'tight'));
  }

  function findNeg() {
    const g = rnd(['bird', 'sea', 'land']);
    const same = shuffle(G(g)).slice(0, 3);
    const odd = rnd(IDS.filter(i => !['bug', g].includes(A[i].g)));
    const text = g === 'bird' ? 'Tap the one that is NOT a bird'
      : g === 'sea' ? 'Tap the one that does NOT live in the sea'
      : 'Tap the one that does NOT live on land';
    const cards = shuffle([...same, odd]).map(i => ({ id: i, html: icon(i), correct: i === odd }));
    setTask({ concepts: ['find:not'], extra: `${A[odd].name === 'fish' ? 'Fish' : 'The ' + A[odd].name} ${g === 'bird' ? 'is not a bird' : g === 'sea' ? 'does not live in the sea' : 'does not live on land'}.` },
      text, text + '.');
    area.appendChild(renderCards(cards));
  }

  // =====================================================================
  //  🧭 Ranger Says
  // =====================================================================
  function dirsTask() {
    const L = lvl('dirs');
    const bag = L === 1 ? ['sp', 'seq2']
      : L === 2 ? ['sp', 'sp', 'seq2', 'ba']
      : L === 3 ? ['sp', 'between', 'ba', 'ba', 'seq3']
      : ['between', 'ba', 'ba', 'seq3', 'seq3'];
    const t = rnd(bag);
    area.innerHTML = '';
    if (t === 'sp') return spatialTask(L);
    if (t === 'between') return betweenTask();
    return seqTask(t);
  }

  const SPOT = {
    'on':          { x: 50, y: 31, z: 4, s: 0.9 },
    'behind':      { x: 63, y: 52, z: 1, s: 0.85 },
    'in front of': { x: 50, y: 88, z: 4, s: 1.12 },
    'next to':     { x: 13, y: 64, z: 4, s: 1 },
  };

  function renderScene(lands, sprites) {
    const sc = el('div', 'rscene');
    for (const l of lands) {
      const e = el('span', 'rland', l.e);
      e.style.left = l.x + '%'; e.style.top = l.y + '%';
      e.style.fontSize = `min(${l.s}vh, ${l.s * 1.1}vw)`;
      sc.appendChild(e);
    }
    const cards = [];
    for (const s of sprites) {
      const b = el('button', 'rsprite', icon(s.id));
      b.style.left = s.x + '%'; b.style.top = s.y + '%'; b.style.zIndex = s.z;
      b.style.transform = `translate(-50%,-50%) scale(${s.s})`;
      const c = { id: s.id, correct: !!s.ok, node: b };
      b.addEventListener('pointerdown', () => onPick(b, c));
      cards.push(c);
      sc.appendChild(b);
    }
    task.cards = cards;
    area.appendChild(sc);
  }

  function spatialTask(L) {
    const preps = L === 1 ? ['on', 'in front of', 'next to'] : ['on', 'in front of', 'next to', 'behind'];
    const prep = Mastery.pickWeak(SKILL.dirs, preps.map(p => 'dir:' + p)).split(':')[1];
    const land = rnd([{ e: '🪨', name: 'rock' }, { e: '🌳', name: 'tree' }]);
    const animals = shuffle(IDS.filter(i => A[i].g !== 'bug')).slice(0, preps.length);
    const sprites = preps.map((p, i) => Object.assign({ id: animals[i], ok: p === prep }, SPOT[p]));
    const text = `Who is ${prep} the ${land.name}?`;
    const target = sprites.find(s => s.ok).id;
    setTask({ concepts: ['dir:' + prep], extra: `The ${A[target].name} is ${prep} the ${land.name}.` }, text, text);
    renderScene([{ e: land.e, x: 50, y: 62, s: 28 }], sprites);
  }

  function betweenTask() {
    const animals = shuffle(IDS.filter(i => A[i].g !== 'bug')).slice(0, 3);
    const sprites = [
      { id: animals[0], x: 50, y: 66, z: 4, s: 1, ok: true },
      { id: animals[1], x: 8,  y: 66, z: 4, s: 1 },
      { id: animals[2], x: 92, y: 66, z: 4, s: 1 },
    ];
    const text = 'Who is between the rock and the tree?';
    setTask({ concepts: ['dir:between'], extra: `The ${A[animals[0]].name} is between them.` }, text, text);
    renderScene([{ e: '🪨', x: 28, y: 64, s: 24 }, { e: '🌳', x: 72, y: 62, s: 26 }], sprites);
  }

  function seqTask(kind) {
    const n = kind === 'seq3' ? 3 : 2;
    const pool = shuffle(IDS.filter(i => A[i].g !== 'bug')).slice(0, 4);
    const [a, b, c] = pool;
    const N = i => 'the ' + A[i].name;
    let order, text, concepts;
    if (kind === 'seq2') {
      order = [a, b]; concepts = ['dir:first-then'];
      text = `First tap ${N(a)}, then tap ${N(b)}`;
    } else if (kind === 'seq3') {
      order = [a, b, c]; concepts = ['dir:three-step'];
      text = `First tap ${N(a)}, then ${N(b)}, and last ${N(c)}`;
    } else {
      const v = rnd([0, 1, 2, 3]);
      if (v === 0) { order = [b, a]; text = `Before you tap ${N(a)}, tap ${N(b)}`; concepts = ['dir:before']; }
      else if (v === 1) { order = [a, b]; text = `Tap ${N(a)} before you tap ${N(b)}`; concepts = ['dir:before']; }
      else if (v === 2) { order = [a, b]; text = `After you tap ${N(a)}, tap ${N(b)}`; concepts = ['dir:after']; }
      else { order = [b, a]; text = `Tap ${N(a)} after you tap ${N(b)}`; concepts = ['dir:after']; }
    }
    setTask({ concepts, seq: order, step: 0 }, text, 'Listen carefully! ' + text + '.');
    const cards = shuffle(pool).map(i => ({ id: i, html: icon(i) }));
    area.appendChild(renderCards(cards));
  }

  // =====================================================================
  //  🤔 Silly or Sensible?
  // =====================================================================
  function sillyTask() {
    const L = lvl('silly');
    let pool = YN.filter(x => x.lvl <= L && !recentYN.includes(x.q));
    if (!pool.length) pool = YN.filter(x => x.lvl <= L);
    // lean on the newest level so it stays at the edge of what he can do
    const hard = pool.filter(x => x.lvl >= L);
    const item = rnd(hard.length && Math.random() < 0.6 ? hard : pool);
    recentYN.push(item.q);
    if (recentYN.length > 8) recentYN.shift();

    area.innerHTML = '';
    setTask({ concepts: ['yn:' + item.k], yn: item }, item.q, item.q);
    const wrap = el('div', 'yn-wrap');
    wrap.appendChild(el('div', 'yn-pics', item.pics.map(p => `<span>${icon(p)}</span>`).join('')));
    const row = el('div', 'yn-row');
    for (const yes of [true, false]) {
      const b = el('button', 'yn-btn ' + (yes ? 'yes' : 'no'), yes ? '👍<small>Yes</small>' : '👎<small>No</small>');
      b.addEventListener('pointerdown', () => answerYN(b, yes));
      row.appendChild(b);
    }
    wrap.appendChild(row);
    area.appendChild(wrap);
    Speech.say(item.q);
  }

  function answerYN(btn, yes) {
    if (!task || task.locked) return;
    const item = task.yn;
    if (yes === item.yes) {
      btn.classList.add('correct');
      finish(item.why);
    } else {
      // only two choices, so show why instead of letting him guess through
      firstTry = false;
      btn.classList.add('wrong');
      task.locked = true;
      const t = task;
      Mastery.record(SKILL.silly, t.concepts, false, 4);
      roundDone += 1;
      renderProgress();
      const done = roundDone >= ROUND_LEN;
      Speech.say('Good try! ' + item.why).then(() => {
        if (done) { App.finishRound('🦘', 'Great ranger work!'); roundDone = 0; renderProgress(); setTimeout(nextTask, 2600); }
        else setTimeout(nextTask, 400);
      });
    }
  }

  // ---------- grown-ups ----------
  function label(key) {
    const [kind, val] = key.split(':');
    if (kind === 'animal') return A[val] ? A[val].name : val;
    if (kind === 'story') return `story: "${val}" questions`;
    if (kind === 'find') return {
      size: '"big / little"', colour: 'colour words', three: '3-part descriptions (big koala on the blue card)',
      more: '"more"', fewer: '"fewer"', most: '"most"', fewest: '"fewest"', none: '"no / none"', not: '"NOT" (negation)',
    }[val] || val;
    if (kind === 'dir') return {
      'first-then': '"first… then…"', 'three-step': '3-step directions', before: '"before"', after: '"after"',
      on: '"on"', 'in front of': '"in front of"', 'next to': '"next to"', behind: '"behind"', between: '"between"',
    }[val] || val;
    if (kind === 'yn') return { fact: 'yes/no facts', reason: 'reasoning (sensible?)', rule: 'ranger rules' }[val] || val;
    return val;
  }

  const SKILLS = [
    { skill: SKILL.story, title: "📖 Quin's Stories — story listening" },
    { skill: SKILL.find,  title: '🔍 Find It! — descriptions, quantity, "not"' },
    { skill: SKILL.dirs,  title: '🧭 Ranger Says — position words & directions' },
    { skill: SKILL.silly, title: '🤔 Silly or Sensible? — yes/no reasoning' },
  ];

  function bindControls() {
    document.getElementById('rotto-repeat').addEventListener('pointerdown', () => speakPrompt());
    document.getElementById('rotto-story-btn').addEventListener('pointerdown', () => speakStory());
    document.getElementById('rotto-hub-btn').addEventListener('pointerdown', () => showHub());
  }

  return { start, bindControls, label, SKILLS, icon, QUOKKA };
})();
