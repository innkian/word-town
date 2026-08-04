// Content banks for Word Town, built around Zac's speech screening targets:
// comprehension (directions/concepts/questions), semantics (labels/functions/
// categories), articulation (/l/, /y/, /zh/) and narrative sequencing.

// ---- everyday objects (nouns) — used by Delivery Run + Sorting Shop ----
const OBJECTS = [
  { id: 'dog',      e: '🐶', name: 'dog',      cat: 'animals' },
  { id: 'cat',      e: '🐱', name: 'cat',      cat: 'animals' },
  { id: 'fish',     e: '🐟', name: 'fish',     cat: 'animals' },
  { id: 'bird',     e: '🐦', name: 'bird',     cat: 'animals' },
  { id: 'frog',     e: '🐸', name: 'frog',     cat: 'animals' },
  { id: 'duck',     e: '🦆', name: 'duck',     cat: 'animals' },
  { id: 'cow',      e: '🐮', name: 'cow',      cat: 'animals' },
  { id: 'horse',    e: '🐴', name: 'horse',    cat: 'animals' },
  { id: 'monkey',   e: '🐵', name: 'monkey',   cat: 'animals' },
  { id: 'elephant', e: '🐘', name: 'elephant', cat: 'animals' },
  { id: 'lion',     e: '🦁', name: 'lion',     cat: 'animals' },
  { id: 'pig',      e: '🐷', name: 'pig',      cat: 'animals' },

  { id: 'apple',    e: '🍎', name: 'apple',    cat: 'food' },
  { id: 'banana',   e: '🍌', name: 'banana',   cat: 'food' },
  { id: 'bread',    e: '🍞', name: 'bread',    cat: 'food' },
  { id: 'cheese',   e: '🧀', name: 'cheese',   cat: 'food' },
  { id: 'pizza',    e: '🍕', name: 'pizza',    cat: 'food' },
  { id: 'carrot',   e: '🥕', name: 'carrot',   cat: 'food' },
  { id: 'grapes',   e: '🍇', name: 'grapes',   cat: 'food', pl: true },
  { id: 'cake',     e: '🎂', name: 'cake',     cat: 'food' },
  { id: 'strawberry', e: '🍓', name: 'strawberry', cat: 'food' },
  { id: 'watermelon', e: '🍉', name: 'watermelon', cat: 'food' },

  { id: 'car',      e: '🚗', name: 'car',      cat: 'vehicles' },
  { id: 'bus',      e: '🚌', name: 'bus',      cat: 'vehicles' },
  { id: 'firetruck', e: '🚒', name: 'fire truck', cat: 'vehicles' },
  { id: 'ambulance', e: '🚑', name: 'ambulance', cat: 'vehicles' },
  { id: 'bike',     e: '🚲', name: 'bike',     cat: 'vehicles' },
  { id: 'plane',    e: '✈️', name: 'plane',    cat: 'vehicles' },
  { id: 'train',    e: '🚂', name: 'train',    cat: 'vehicles' },
  { id: 'boat',     e: '⛵', name: 'boat',     cat: 'vehicles' },
  { id: 'digger',   e: '🚜', name: 'digger',   cat: 'vehicles' },

  { id: 'sock',     e: '🧦', name: 'socks',    cat: 'clothes', pl: true },
  { id: 'shoe',     e: '👟', name: 'shoes',    cat: 'clothes', pl: true },
  { id: 'shirt',    e: '👕', name: 'shirt',    cat: 'clothes' },
  { id: 'cap',      e: '🧢', name: 'cap',      cat: 'clothes' },
  { id: 'jacket',   e: '🧥', name: 'jacket',   cat: 'clothes' },
  { id: 'pants',    e: '👖', name: 'pants',    cat: 'clothes', pl: true },
  { id: 'gloves',   e: '🧤', name: 'gloves',   cat: 'clothes', pl: true },

  { id: 'ball',     e: '⚽', name: 'ball',     cat: 'toys' },
  { id: 'teddy',    e: '🧸', name: 'teddy',    cat: 'toys' },
  { id: 'kite',     e: '🪁', name: 'kite',     cat: 'toys' },
  { id: 'yoyo',     e: '🪀', name: 'yo-yo',    cat: 'toys' },
  { id: 'balloon',  e: '🎈', name: 'balloon',  cat: 'toys' },
];
const OBJ_BY_ID = Object.fromEntries(OBJECTS.map(o => [o.id, o]));

const CATEGORIES = {
  animals:  { label: 'Animals',  e: '🐾' },
  food:     { label: 'Food',     e: '🍽️' },
  vehicles: { label: 'Vehicles', e: '🚗' },
  clothes:  { label: 'Clothes',  e: '👕' },
  toys:     { label: 'Toys',     e: '🧸' },
};

// ---- action pictures for "who is …?" questions ----
const ACTIONS = [
  { id: 'running',  e: '🏃', name: 'running' },
  { id: 'swimming', e: '🏊', name: 'swimming' },
  { id: 'sleeping', e: '😴', name: 'sleeping' },
  { id: 'riding',   e: '🚴', name: 'riding a bike' },
  { id: 'dancing',  e: '💃', name: 'dancing' },
  { id: 'climbing', e: '🧗', name: 'climbing' },
  { id: 'cooking',  e: '🧑‍🍳', name: 'cooking' },
  { id: 'singing',  e: '🎤', name: 'singing' },
];

// ---- "where" questions ----
const WHERE_QUESTIONS = [
  { q: 'Where does the fish swim?',   answer: '🌊', answerWord: 'in the water', wrong: ['🛏️', '🚗', '🌳'] },
  { q: 'Where does the bird sit?',    answer: '🌳', answerWord: 'in the tree',  wrong: ['🌊', '🛒', '🛁'] },
  { q: 'Where do we sleep?',          answer: '🛏️', answerWord: 'in a bed',     wrong: ['🚂', '🌊', '🍳'] },
  { q: 'Where do we have a bath?',    answer: '🛁', answerWord: 'in the bath',  wrong: ['🛏️', '🌳', '🚌'] },
  { q: 'Where does the car drive?',   answer: '🛣️', answerWord: 'on the road',  wrong: ['🌊', '🛏️', '🌳'] },
  { q: 'Where does the bee go?',      answer: '🌸', answerWord: 'to the flower', wrong: ['🛁', '🚗', '🧦'] },
];

// ---- function questions ("what do we use to …?") for the Sorting Shop ----
const FUNCTIONS = [
  { q: 'Which one do we drink from?',        id: 'cup',       e: '🥤', name: 'cup' },
  { q: 'Which one do we eat with?',          id: 'spoon',     e: '🥄', name: 'spoon' },
  { q: 'Which one brushes our teeth?',       id: 'toothbrush', e: '🪥', name: 'toothbrush' },
  { q: 'Which one do we sleep in?',          id: 'bed',       e: '🛏️', name: 'bed' },
  { q: 'Which one goes on our feet?',        id: 'shoe',      e: '👟', name: 'shoes' },
  { q: 'Which one goes on our head?',        id: 'cap',       e: '🧢', name: 'cap' },
  { q: 'Which one cuts paper?',              id: 'scissors',  e: '✂️', name: 'scissors' },
  { q: 'Which one washes our hands?',        id: 'soap',      e: '🧼', name: 'soap' },
  { q: 'Which one do we read?',              id: 'book',      e: '📖', name: 'book' },
  { q: 'Which one sweeps the floor?',        id: 'broom',     e: '🧹', name: 'broom' },
  { q: 'Which one keeps us dry in the rain?', id: 'umbrella', e: '☂️', name: 'umbrella' },
  { q: 'Which one do we draw with?',         id: 'crayon',    e: '🖍️', name: 'crayon' },
  { q: 'Which one tells the time?',          id: 'clock',     e: '⏰', name: 'clock' },
  { q: 'Which one opens the door?',          id: 'key',       e: '🔑', name: 'key' },
  { q: 'Which one flies in the sky?',        id: 'plane',     e: '✈️', name: 'plane' },
  { q: 'Which one do we kick?',              id: 'ball',      e: '⚽', name: 'ball' },
];
// pool of distractor pictures for function questions
const FUNCTION_DISTRACTORS = ['🥤','🥄','🪥','🛏️','👟','🧢','✂️','🧼','📖','🧹','☂️','🖍️','⏰','🔑','✈️','⚽','🧸','🍌','🚗','🧦'];

// ---- articulation word banks ----
// Cue lines are spoken to Zac before the word; tip lines are for grown-ups.
const SOUND_SETS = {
  l: {
    label: 'L sound', e: '🦁', cue: 'Put your tongue up behind your top teeth. Lll.',
    tip: 'For /l/: tongue tip lifts to the bump behind the top teeth. Try smiling while saying it.',
    words: [
      { w: 'lion',   e: '🦁', slow: 'lll — ion' },
      { w: 'leaf',   e: '🍃', slow: 'lll — eaf' },
      { w: 'lolly',  e: '🍭', slow: 'lll — olly' },
      { w: 'ladder', e: '🪜', slow: 'lll — adder' },
      { w: 'leg',    e: '🦵', slow: 'lll — eg' },
      { w: 'lemon',  e: '🍋', slow: 'lll — emon' },
      { w: 'light',  e: '💡', slow: 'lll — ight' },
      { w: 'lock',   e: '🔒', slow: 'lll — ock' },
      { w: 'lizard', e: '🦎', slow: 'lll — izard' },
      { w: 'lunch',  e: '🍱', slow: 'lll — unch' },
      { w: 'ball',   e: '⚽', slow: 'ba — lll' },
      { w: 'bell',   e: '🔔', slow: 'be — lll' },
      { w: 'snail',  e: '🐌', slow: 'snai — lll' },
      { w: 'wheel',  e: '🛞', slow: 'whee — lll' },
      { w: 'owl',    e: '🦉', slow: 'ow — lll' },
      { w: 'shell',  e: '🐚', slow: 'she — lll' },
    ],
  },
  y: {
    label: 'Y sound', e: '🪀', cue: 'Make a big smile and say yee. Yyy.',
    tip: 'For /y/: start from a big smile ("ee" position) then glide into the word — "ee-es" becomes "yes".',
    words: [
      { w: 'yo-yo',   e: '🪀', slow: 'yyy — o yo' },
      { w: 'yellow',  e: '🟡', slow: 'yyy — ellow' },
      { w: 'yawn',    e: '🥱', slow: 'yyy — awn' },
      { w: 'yum',     e: '😋', slow: 'yyy — um' },
      { w: 'yes',     e: '👍', slow: 'yyy — es' },
      { w: 'yoghurt', e: '🥣', slow: 'yyy — oghurt' },
      { w: 'yolk',    e: '🍳', slow: 'yyy — olk' },
      { w: 'yay',     e: '🎉', slow: 'yyy — ay' },
    ],
  },
  zh: {
    label: 'ZH sound', e: '📺', cue: 'Make a buzzy bee sound with round lips. Zzzhh.',
    tip: 'For /zh/ (the buzzy middle sound in "treasure"): say "sh" and switch the voice on, like a bee buzzing.',
    words: [
      { w: 'treasure',   e: '💎', slow: 'trea — zzhh — ure' },
      { w: 'television', e: '📺', slow: 'tele — vi — zzhh — un' },
      { w: 'measure',    e: '📏', slow: 'mea — zzhh — ure' },
      { w: 'explosion',  e: '💥', slow: 'explo — zzhh — un' },
      { w: 'garage',     e: '🅿️', slow: 'gara — zzhh' },
      { w: 'usual',      e: '⭐', slow: 'u — zzhh — ual' },
    ],
  },
};

// ---- three-panel stories for Story Road ----
// Each line is modelled with first/then/last sequence words (also a
// comprehension target), kept short so Zac can echo them.
const STORIES = [
  {
    id: 'chick', title: 'The Baby Chick',
    panels: [
      { e: '🥚', line: 'First, there is an egg.' },
      { e: '🐣', line: 'Then, the egg cracks open.' },
      { e: '🐥', line: 'Last, a baby chick pops out!' },
    ],
  },
  {
    id: 'flower', title: 'The Little Seed',
    panels: [
      { e: '🌱', line: 'First, a little seed grows.' },
      { e: '🌿', line: 'Then, it gets bigger and bigger.' },
      { e: '🌻', line: 'Last, it turns into a big flower!' },
    ],
  },
  {
    id: 'rainbow', title: 'The Rainy Day',
    panels: [
      { e: '☁️', line: 'First, big clouds come.' },
      { e: '🌧️', line: 'Then, the rain falls down.' },
      { e: '🌈', line: 'Last, a rainbow comes out!' },
    ],
  },
  {
    id: 'sandwich', title: 'Yummy Lunch',
    panels: [
      { e: '🍞', line: 'First, we get the bread.' },
      { e: '🥪', line: 'Then, we make a sandwich.' },
      { e: '😋', line: 'Last, we eat it all up. Yum!' },
    ],
  },
  {
    id: 'bedtime', title: 'Bedtime',
    panels: [
      { e: '🛁', line: 'First, we have a bath.' },
      { e: '🪥', line: 'Then, we brush our teeth.' },
      { e: '😴', line: 'Last, we go to sleep.' },
    ],
  },
  {
    id: 'carwash', title: 'The Dirty Car',
    panels: [
      { e: '🚗', line: 'First, the car is very dirty.' },
      { e: '🫧', line: 'Then, we wash it with bubbles.' },
      { e: '✨', line: 'Last, the car is shiny and clean!' },
    ],
  },
  {
    id: 'beach', title: 'Beach Day',
    panels: [
      { e: '🚗', line: 'First, we drive to the beach.' },
      { e: '🏖️', line: 'Then, we build a sandcastle.' },
      { e: '🍦', line: 'Last, we eat an ice cream!' },
    ],
  },
  {
    id: 'butterfly', title: 'The Caterpillar',
    panels: [
      { e: '🐛', line: 'First, a caterpillar eats and eats.' },
      { e: '🍃', line: 'Then, it sleeps in a leaf.' },
      { e: '🦋', line: 'Last, it becomes a butterfly!' },
    ],
  },
  {
    id: 'birthday', title: 'The Birthday Party',
    panels: [
      { e: '🎈', line: 'First, we blow up the balloons.' },
      { e: '🎂', line: 'Then, we get the birthday cake.' },
      { e: '🎉', line: 'Last, we have a party. Hooray!' },
    ],
  },
  {
    id: 'race', title: 'The Big Race',
    panels: [
      { e: '🚦', line: 'First, the light turns green.' },
      { e: '🏎️', line: 'Then, the cars go super fast.' },
      { e: '🏆', line: 'Last, the winner gets a trophy!' },
    ],
  },
];

// ---- reward cars for My Garage (one unlocked every 5 stars) ----
const REWARD_CARS = ['🚗','🚕','🚙','🏎️','🚓','🚑','🚒','🛻','🚜','🏍️','🚚','🚛','🚌','🚀','🚁','⛵','🚂','🛺','🦼','🛸'];

// ---- prepositions for the drag rounds ----
const PREPOSITIONS = ['on', 'in', 'under', 'next to'];

// ---- encouragements ----
const PRAISE = ['Great job!', 'Well done!', 'You did it!', 'Awesome!', 'Super!', 'Fantastic!', 'Beautiful work!'];
const TRY_AGAIN = ['Good try! Have another go.', 'Almost! Try again.', 'Not quite. Listen again!'];
function praise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }
function tryAgain() { return TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)]; }
function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }
