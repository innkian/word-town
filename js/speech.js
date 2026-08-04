// Text-to-speech via the Web Speech API — no audio files, works offline on iPad.
// Prefers an Australian English voice (Zac's school accent), slowed for a young listener.

const Speech = (() => {
  const supported = 'speechSynthesis' in window;
  let enabled = true;
  let voice = null;

  function pickVoice() {
    if (!supported) return;
    const vs = speechSynthesis.getVoices();
    voice =
      vs.find(v => v.lang === 'en-AU' && /Karen/i.test(v.name)) ||
      vs.find(v => v.lang === 'en-AU') ||
      vs.find(v => v.lang === 'en-GB') ||
      vs.find(v => v.lang === 'en-US') ||
      vs.find(v => v.lang && v.lang.startsWith('en')) ||
      null;
  }
  if (supported) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  // iOS only allows speech after a user gesture — warm it up on the first tap.
  let warmed = false;
  function warmUp() {
    if (!supported || warmed) return;
    warmed = true;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
  document.addEventListener('pointerdown', warmUp, { once: true, capture: true });
  document.addEventListener('touchstart', warmUp, { once: true, capture: true });

  // Fire-and-forget speech. interrupt:false queues after current speech.
  function say(text, opts = {}) {
    if (!supported || !enabled || !text) return Promise.resolve();
    return new Promise(resolve => {
      if (opts.interrupt !== false) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = opts.rate != null ? opts.rate : 0.85;
      u.pitch = opts.pitch != null ? opts.pitch : 1.06;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
      // safety: never leave a caller hanging (headless/no-voice environments)
      setTimeout(resolve, 500 + text.length * 130);
    });
  }

  // Extra-slow speech for articulation modelling ("llll — ion. Lion!").
  function saySlow(text) { return say(text, { rate: 0.55, pitch: 1.0 }); }

  function stop() { if (supported) speechSynthesis.cancel(); }

  return {
    say, saySlow, stop,
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; if (!v) stop(); },
    get supported() { return supported; },
  };
})();
