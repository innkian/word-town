// Text-to-speech via the Web Speech API — no audio files, works offline on iPad.
//
// Reliability notes (learned the hard way — the game was silent on iPad):
//   * getVoices() also lists voices that are NOT downloaded to the device.
//     Assigning one to an utterance produces SILENCE with no error event, so
//     we only ever pick voices with localService === true, and we always keep
//     the browser default (no voice set) as the final fallback.
//   * cancel() immediately followed by speak() drops the utterance on Safari
//     and Chrome, so a cancel is followed by a tick's delay before speaking.
//   * Safari stops speaking after ~15s unless resume() is pinged.
//   * If a chosen voice yields no 'start' event, we retry once with no voice.

const Speech = (() => {
  const supported = 'speechSynthesis' in window;
  let enabled = true;
  let voice = null;
  let voiceLocked = false;   // set once a voice has actually produced audio

  const PREF_KEY = 'wordtown_voice';

  function usableVoices() {
    if (!supported) return [];
    // localService voices are installed on the device and actually speak.
    return speechSynthesis.getVoices()
      .filter(v => v.lang && v.lang.toLowerCase().startsWith('en') && v.localService !== false);
  }

  function pickVoice() {
    if (!supported) return;
    const vs = usableVoices();
    if (!vs.length) { voice = null; return; }

    // Honour a voice a grown-up chose in the settings panel.
    const saved = localStorage.getItem(PREF_KEY);
    if (saved) {
      const match = vs.find(v => v.name === saved);
      if (match) { voice = match; return; }
    }
    voice = vs.slice().sort((a, b) => score(b) - score(a))[0] || null;
  }

  // Robotic sound comes from low-quality "compact" voices and novelty voices.
  // Rank by quality first (Premium / Siri / Enhanced / Natural), then accent.
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe|trinoids|whisper|wobble|zarvox|superstar|fred|junior|ralph|kathy|eloquence|grandma|grandpa|rocko|sandy|shelley|flo\b|eddy|reed/i;
  function score(v) {
    const n = v.name || '';
    let sc = 0;
    if (/premium/i.test(n)) sc += 120;
    if (/siri/i.test(n)) sc += 100;
    if (/natural|neural|online/i.test(n)) sc += 100;
    if (/enhanced/i.test(n)) sc += 70;
    if (/compact/i.test(n)) sc -= 40;
    if (NOVELTY.test(n)) sc -= 300;
    if (v.lang === 'en-AU' || v.lang === 'en_AU') sc += 30;
    else if (v.lang === 'en-GB') sc += 12;
    else if (v.lang === 'en-US') sc += 8;
    if (/karen|matilda|lee|catherine|samantha|daniel|serena/i.test(n)) sc += 4;
    return sc;
  }
  if (supported) {
    pickVoice();
    speechSynthesis.onvoiceschanged = () => { if (!voiceLocked) pickVoice(); };
  }

  // iOS only allows speech after a user gesture — warm it up on the first tap.
  let warmed = false;
  function warmUp() {
    if (!supported || warmed) return;
    warmed = true;
    const u = new SpeechSynthesisUtterance('.');
    u.volume = 0;
    try { speechSynthesis.speak(u); } catch (e) {}
  }
  document.addEventListener('pointerdown', warmUp, { once: true, capture: true });
  document.addEventListener('touchstart', warmUp, { once: true, capture: true });

  // Safari silently stops long speech unless resume() is pinged periodically.
  if (supported) {
    setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) speechSynthesis.resume();
    }, 5000);
  }

  function utter(text, opts, useVoice) {
    const u = new SpeechSynthesisUtterance(text);
    if (useVoice) u.voice = useVoice;
    u.lang = (useVoice && useVoice.lang) || 'en-AU';
    u.rate = opts.rate != null ? opts.rate : 0.9;
    u.pitch = opts.pitch != null ? opts.pitch : 1.0;
    return u;
  }

  // Fire-and-forget speech. interrupt:false queues after current speech.
  function say(text, opts = {}) {
    if (!supported || !enabled || !text) return Promise.resolve();

    return new Promise(resolve => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };

      const speakNow = () => {
        let started = false;
        const u = utter(text, opts, voice);
        u.onstart = () => { started = true; voiceLocked = true; };
        u.onend = finish;
        u.onerror = () => {
          // A dud voice errors or stays silent — drop it and use the default.
          if (voice) { voice = null; localStorage.removeItem(PREF_KEY); }
          finish();
        };
        try { speechSynthesis.speak(u); } catch (e) { return finish(); }

        // If a custom voice never starts, it isn't really installed: retry once
        // with the browser default so the game never goes quiet.
        if (voice && !voiceLocked) {
          setTimeout(() => {
            if (started || done) return;
            speechSynthesis.cancel();
            voice = null;
            localStorage.removeItem(PREF_KEY);
            const plain = utter(text, opts, null);
            plain.onend = finish;
            plain.onerror = finish;
            try { speechSynthesis.speak(plain); } catch (e) { finish(); }
          }, 600);
        }
      };

      if (opts.interrupt !== false && (speechSynthesis.speaking || speechSynthesis.pending)) {
        speechSynthesis.cancel();
        setTimeout(speakNow, 60);   // cancel+speak in the same tick gets dropped
      } else {
        speakNow();
      }

      // safety: never leave a caller hanging (headless/no-voice environments)
      setTimeout(finish, 1200 + text.length * 130);
    });
  }

  // Extra-slow speech for articulation modelling ("llll — ion. Lion!").
  function saySlow(text) { return say(text, { rate: 0.55, pitch: 1.0 }); }

  function stop() { if (supported) speechSynthesis.cancel(); }

  // ---- grown-ups voice picker ----
  function listVoices() { return usableVoices().sort((a, b) => score(b) - score(a)).map(v => ({ name: v.name, lang: v.lang })); }
  function currentVoice() { return voice ? voice.name : 'Default'; }
  function setVoice(name) {
    const match = usableVoices().find(v => v.name === name);
    voice = match || null;
    if (match) localStorage.setItem(PREF_KEY, name); else localStorage.removeItem(PREF_KEY);
    voiceLocked = false;
    stop();
    say('Hello Zac! Can you hear me?');
  }

  return {
    say, saySlow, stop, listVoices, currentVoice, setVoice,
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; if (!v) stop(); },
    get supported() { return supported; },
  };
})();
