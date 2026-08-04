// Hold-to-record microphone with instant playback, so Zac can hear his own words.
// Gracefully disabled when the mic is unavailable or permission is denied.

const Recorder = (() => {
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  let stream = null;
  let rec = null;
  let chunks = [];
  let lastUrl = null;
  let audioEl = null;
  let denied = false;

  async function ensureStream() {
    if (stream) return true;
    if (!supported || denied) return false;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e) {
      denied = true;
      return false;
    }
  }

  async function start() {
    if (!(await ensureStream())) return false;
    if (rec && rec.state === 'recording') return true;
    chunks = [];
    try {
      rec = new MediaRecorder(stream);
    } catch (e) {
      return false;
    }
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.start();
    return true;
  }

  function stop() {
    return new Promise(resolve => {
      if (!rec || rec.state !== 'recording') return resolve(null);
      rec.onstop = () => {
        if (!chunks.length) return resolve(null);
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/mp4' });
        if (lastUrl) URL.revokeObjectURL(lastUrl);
        lastUrl = URL.createObjectURL(blob);
        resolve(lastUrl);
      };
      rec.stop();
    });
  }

  function play() {
    if (!lastUrl) return;
    if (!audioEl) audioEl = new Audio();
    audioEl.src = lastUrl;
    audioEl.play().catch(() => {});
  }

  function hasRecording() { return !!lastUrl; }
  function clear() { if (lastUrl) URL.revokeObjectURL(lastUrl); lastUrl = null; }

  return { start, stop, play, clear, hasRecording, get supported() { return supported && !denied; } };
})();
