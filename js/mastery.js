// Adaptive mastery engine shared by the mini-games (same idea as Turbo Wheels'
// Listen & Find): every concept keeps a 0..1 score, weak concepts come up more
// often, and each game's level rises/falls with recent accuracy so it always
// sits at the edge of what Zac can do.

const Mastery = (() => {
  const LSKEY = 'wordtown_progress_v1';

  function blankSkill() {
    return { level: 1, streak: 0, recent: [], concepts: {} };
  }
  function blank() {
    return {
      skills: { listen: blankSkill(), shop: blankSkill() },
      stars: 0,
      totalCorrect: 0,
      soundsPracticed: {},   // word -> times practiced
      storiesTold: {},       // story id -> times completed
      unlockedCars: 1,       // first car free
    };
  }

  let state = blank();
  try {
    const raw = localStorage.getItem(LSKEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state = Object.assign(blank(), saved);
      state.skills = Object.assign(blank().skills, saved.skills || {});
    }
  } catch (e) {}
  function persist() { try { localStorage.setItem(LSKEY, JSON.stringify(state)); } catch (e) {} }

  function skill(name) {
    if (!state.skills[name]) state.skills[name] = blankSkill();
    return state.skills[name];
  }
  function conceptState(skillName, key) {
    const s = skill(skillName);
    if (!s.concepts[key]) s.concepts[key] = { score: 0.35, seen: 0, lastSeen: 0 };
    return s.concepts[key];
  }
  function score(skillName, key) { return conceptState(skillName, key).score; }

  // Weighted pick: prefers weak / stale concepts, occasionally reviews mastered ones.
  function pickWeak(skillName, keys) {
    const now = Date.now();
    const mastered = keys.filter(k => conceptState(skillName, k).score >= 0.8);
    if (mastered.length && Math.random() < 0.22) {
      return mastered[Math.floor(Math.random() * mastered.length)];
    }
    let best = keys[0], bestW = -1;
    for (const k of keys) {
      const c = conceptState(skillName, k);
      const staleDays = Math.min(3, (now - c.lastSeen) / 86400000);
      const w = (1 - c.score) + staleDays * 0.08 + Math.random() * 0.2;
      if (w > bestW) { bestW = w; best = k; }
    }
    return best;
  }

  // Record an answer. Returns 'levelup' | 'leveldown' | null.
  function record(skillName, conceptKeys, correct, maxLevel = 4) {
    const s = skill(skillName);
    const now = Date.now();
    for (const k of conceptKeys) {
      const c = conceptState(skillName, k);
      const a = correct ? 0.3 : 0.45;
      c.score = Math.max(0, Math.min(1, c.score * (1 - a) + (correct ? 1 : 0) * a));
      c.seen += 1;
      c.lastSeen = now;
    }
    s.recent.push({ correct, level: s.level, ts: now });
    if (s.recent.length > 30) s.recent.shift();
    if (correct) { s.streak += 1; state.totalCorrect += 1; } else { s.streak = 0; }

    let result = null;
    const atLevel = s.recent.filter(r => r.level === s.level).slice(-8);
    if (atLevel.length >= 6) {
      const acc = atLevel.filter(r => r.correct).length / atLevel.length;
      if (acc >= 0.8 && s.level < maxLevel) { s.level += 1; s.recent = []; result = 'levelup'; }
      else if (acc <= 0.35 && s.level > 1) { s.level -= 1; s.recent = []; result = 'leveldown'; }
    }
    persist();
    return result;
  }

  function addStar() {
    state.stars += 1;
    persist();
    return state.stars;
  }
  // A new garage car unlocks every 5 stars.
  function pendingCarUnlock() {
    const earned = Math.min(REWARD_CARS.length, 1 + Math.floor(state.stars / 5));
    return earned > state.unlockedCars;
  }
  function claimCar() {
    state.unlockedCars = Math.min(REWARD_CARS.length, state.unlockedCars + 1);
    persist();
    return REWARD_CARS[state.unlockedCars - 1];
  }

  function notePractice(word) {
    state.soundsPracticed[word] = (state.soundsPracticed[word] || 0) + 1;
    persist();
  }
  function noteStory(id) {
    state.storiesTold[id] = (state.storiesTold[id] || 0) + 1;
    persist();
  }

  // ---- parent-facing summary ----
  function skillSummary(skillName) {
    const s = skill(skillName);
    const last20 = s.recent.slice(-20);
    const concepts = Object.entries(s.concepts)
      .map(([k, c]) => ({ key: k, score: c.score, seen: c.seen }))
      .sort((a, b) => a.score - b.score);
    return {
      level: s.level,
      recentAccuracy: last20.length ? Math.round(100 * last20.filter(r => r.correct).length / last20.length) : null,
      concepts,
      weak: concepts.filter(c => c.seen > 0 && c.score < 0.6).slice(0, 6),
    };
  }

  function reset() { state = blank(); persist(); }

  return {
    pickWeak, record, score, addStar, pendingCarUnlock, claimCar,
    notePractice, noteStory, skillSummary, reset,
    get state() { return state; },
    levelOf(name) { return skill(name).level; },
  };
})();
