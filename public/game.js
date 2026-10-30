(() => {
  const ROUND_SECONDS = 30;
  const SCAN_GAP_MS = 600;
  const MIN_CONF = 0.5;
  const CONFIRM_FRAMES = 2;
  const $ = (id) => document.getElementById(id);

  const state = {
    queue: [], index: 0, score: 0, timeLeft: 0, timer: null,
    checking: false, done: false, results: [],
    live: false, stream: null, round: 0, streak: 0,
  };

  const canLive = () => !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function show(screen) {
    ['start', 'play', 'end'].forEach((s) => { $('screen-' + s).hidden = s !== screen; });
  }

  function isMatch(labels, target) {
    const seen = (l) => labels.some((x) => x.label === l && (x.confidence == null || x.confidence >= MIN_CONF));
    const accepts = (l) => (window.ALIASES && ALIASES[l]) || [l];
    const required = target.all || [target.label];
    return required.every((req) => [...accepts(req), ...(target.also || [])].some(seen));
  }

  function describe(labels) {
    // "orang" selalu terlihat (pemain sendiri), jadi tidak perlu ditampilkan.
    const shown = labels.filter((l) => l.label !== 'person');
    if (!shown.length) return '🤔 AI belum melihat benda apa pun.';
    const names = shown.map((l) => LABEL_ID[l.label] || l.label);
    return '👀 AI melihat: ' + [...new Set(names)].join(', ');
  }

  function openStream(facing) {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  }

  async function attachStream(stream, facing) {
    state.stream = stream;
    state.facing = facing;
    $('video').srcObject = stream;
    // Kamera depan ditampilkan seperti cermin agar terasa alami.
    $('video').classList.toggle('mirror', facing === 'user');
    await $('video').play().catch(() => {});
  }

  async function startCamera() {
    if (state.stream) return true;
    if (!canLive()) return false;
    const facing = localStorage.getItem('facing') || 'environment';
    try {
      await attachStream(await openStream(facing), facing);
      const cams = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
      $('btn-flip').hidden = cams.length < 2;
      return true;
    } catch (err) {
      console.warn('Kamera tidak bisa dibuka:', err);
      return false;
    }
  }

  async function switchCamera() {
    if (!state.stream) return;
    const prev = state.facing;
    const next = prev === 'user' ? 'environment' : 'user';
    $('btn-flip').disabled = true;
    state.stream.getTracks().forEach((t) => t.stop());
    try {
      await attachStream(await openStream(next), next);
      localStorage.setItem('facing', next);
    } catch (err) {
      console.warn('Gagal ganti kamera:', err);
      await attachStream(await openStream(prev), prev).catch(() => {});
    } finally {
      $('btn-flip').disabled = false;
    }
  }

  function stopCamera() {
    if (state.stream) state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
    $('video').srcObject = null;
  }

  async function startGame() {
    const level = Number($('level').value);
    const rounds = Number($('rounds').value);
    const pool = level ? TARGETS.filter((t) => t.level === level) : TARGETS;
    state.queue = shuffle(pool).slice(0, rounds);
    state.index = 0;
    state.score = 0;
    state.results = [];
    $('btn-start').disabled = true;
    state.live = await startCamera();
    $('btn-start').disabled = false;
    $('round-total').textContent = state.queue.length;
    show('play');
    startRound();
  }

  function startRound() {
    const t = state.queue[state.index];
    state.round++;
    state.timeLeft = ROUND_SECONDS;
    state.checking = false;
    state.done = false;
    state.streak = 0;
    $('round-no').textContent = state.index + 1;
    $('score').textContent = state.score;
    $('target-emoji').textContent = t.emoji;
    $('target').textContent = t.name.toUpperCase();
    $('hint').textContent = '💡 ' + t.hint;
    $('preview').hidden = true;
    $('seen').textContent = '';
    $('btn-next').hidden = true;
    $('btn-skip').hidden = false;
    $('cam-wrap').hidden = !state.live;
    $('scan').classList.remove('hit');
    $('btn-photo').hidden = state.live;
    $('btn-photo').classList.remove('disabled');
    setStatus(state.live ? '🔍 Mencari...' : '', '');
    renderTimer();
    clearInterval(state.timer);
    state.timer = setInterval(tick, 1000);
    if (state.live) scanLoop(state.round);
  }

  function tick() {
    // Mode foto: timer berhenti saat AI memeriksa agar adil. Mode kamera langsung: timer terus jalan.
    if (state.done || (state.checking && !state.live)) return;
    state.timeLeft--;
    renderTimer();
    if (state.timeLeft <= 0) endRound(false, '⏰ Waktu habis!');
  }

  function renderTimer() {
    $('time-left').textContent = state.timeLeft;
    const bar = $('timer-bar');
    bar.style.width = (state.timeLeft / ROUND_SECONDS * 100) + '%';
    const warn = state.timeLeft <= 10;
    bar.classList.toggle('warn', warn);
    document.querySelector('.time-pill').classList.toggle('warn', warn && !state.done);
    if (warn && state.timeLeft > 0 && !state.done) sound('tick');
  }

  let audioCtx = null;
  function sound(kind) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { win: [523, 659, 784, 1047], lose: [392, 330, 262], tick: [880], start: [440, 660] }[kind];
      const len = kind === 'tick' ? 0.05 : 0.12;
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = kind === 'lose' ? 'triangle' : 'square';
        o.frequency.value = f;
        const t = audioCtx.currentTime + i * len;
        g.gain.setValueAtTime(kind === 'tick' ? 0.03 : 0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + len);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + len);
      });
    } catch { /* suara opsional */ }
  }

  function confetti() {
    const box = $('confetti');
    const colors = ['#7b2ff7', '#f107a3', '#ffd23f', '#22c55e', '#3b82f6', '#ff9a3c'];
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      p.style.animationDelay = Math.random() * 0.4 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
      setTimeout(() => p.remove(), 3800);
    }
  }

  function shake() {
    const card = document.querySelector('.card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }

  function setStatus(text, cls) {
    const el = $('status');
    el.textContent = text;
    el.className = 'status ' + cls;
  }

  function endRound(success, message) {
    if (state.done) return;
    state.done = true;
    clearInterval(state.timer);
    const t = state.queue[state.index];
    let points = 0;
    if (success) {
      points = 100 + state.timeLeft * 10;
      state.score += points;
    }
    state.results.push({ target: t, success, points });
    $('score').textContent = state.score;
    setStatus(message + (success ? ` +${points}` : ''), success ? 'ok' : 'fail');
    document.querySelector('.time-pill').classList.remove('warn');
    if (success) { sound('win'); confetti(); } else { sound('lose'); shake(); }
    $('btn-photo').classList.add('disabled');
    $('btn-skip').hidden = true;
    $('btn-next').hidden = false;
    $('btn-next').textContent = state.index + 1 < state.queue.length ? 'Lanjut ➜' : 'Lihat Skor 🏆';
  }

  function nextRound() {
    state.index++;
    if (state.index < state.queue.length) startRound();
    else endGame();
  }

  function endGame() {
    stopCamera();
    show('end');
    $('final-score').textContent = state.score;
    const found = state.results.filter((r) => r.success).length;
    const ratio = found / state.results.length;
    const stars = ratio === 1 ? 3 : ratio >= 0.5 ? 2 : found ? 1 : 0;
    const msg = ['Jangan menyerah! 💪', 'Ayo coba lagi! 🙂', 'Bagus sekali! 👏', 'Pemburu Hebat! 🎉'][stars];
    $('stars').innerHTML = [0, 1, 2].map((i) => `<span class="s${i < stars ? '' : ' off'}">⭐</span>`).join('')
      + `<span class="stars-msg">${msg}</span>`;
    document.querySelector('#screen-end .title').textContent = stars >= 2 ? 'Hebat!' : 'Selesai!';
    if (stars >= 2) { confetti(); sound('win'); }
    $('summary').innerHTML = '';
    state.results.forEach((r) => {
      const li = document.createElement('li');
      li.className = r.success ? 'hit' : 'miss';
      li.innerHTML = `<span class="e"></span><span class="n"></span><span class="p"></span>`;
      li.querySelector('.e').textContent = r.target.emoji;
      li.querySelector('.n').textContent = r.target.name;
      li.querySelector('.p').textContent = r.success ? `+${r.points}` : '❌';
      $('summary').appendChild(li);
    });
  }

  function drawToBlob(source, w, h, maxSide) {
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal memproses gambar'))), 'image/jpeg', 0.8);
    });
  }

  function grabFrame() {
    const v = $('video');
    if (!v.videoWidth) return Promise.resolve(null);
    return drawToBlob(v, v.videoWidth, v.videoHeight, 640);
  }

  function resizeImage(file, maxSide = 1024) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        drawToBlob(img, img.width, img.height, maxSide).then(resolve, reject);
      };
      img.onerror = () => reject(new Error('Foto tidak bisa dibaca'));
      img.src = URL.createObjectURL(file);
    });
  }

  async function detect(blob) {
    const res = await fetch('/api/detect', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Deteksi gagal');
      err.status = res.status;
      throw err;
    }
    return data.labels || [];
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Ambil gambar dari kamera berulang kali sampai benda ketemu atau ronde selesai.
  async function scanLoop(round) {
    const active = () => state.round === round && !state.done;
    while (active()) {
      const blob = await grabFrame();
      if (!blob) { await sleep(300); continue; }
      state.checking = true;
      try {
        const labels = await detect(blob);
        if (!active()) break;
        $('seen').textContent = describe(labels);
        if (isMatch(labels, state.queue[state.index])) {
          // Harus terlihat di 2 gambar berturut-turut supaya salah lihat sesaat tidak dihitung.
          state.streak++;
          if (state.streak >= CONFIRM_FRAMES) {
            $('scan').classList.add('hit');
            $('preview').src = URL.createObjectURL(blob);
            $('preview').hidden = false;
            $('cam-wrap').hidden = true;
            endRound(true, '🎉 Ketemu!');
            break;
          }
          setStatus('👀 Sepertinya ketemu… tahan sebentar!', '');
        } else {
          state.streak = 0;
          setStatus('🔍 Mencari...', '');
        }
      } catch (err) {
        if (!active()) break;
        setStatus('⚠️ ' + err.message, 'fail');
        // Key salah tidak akan sembuh dengan mencoba lagi.
        if (err.status === 500 || /API key/.test(err.message)) break;
        await sleep(2000);
      } finally {
        state.checking = false;
      }
      await sleep(SCAN_GAP_MS);
    }
  }

  async function onPhoto(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file || state.done || state.checking) return;

    state.checking = true;
    $('btn-photo').classList.add('disabled');
    $('seen').textContent = '';
    setStatus('🔍 AI sedang melihat...', '');

    try {
      const blob = await resizeImage(file);
      $('preview').src = URL.createObjectURL(blob);
      $('preview').hidden = false;
      const labels = await detect(blob);
      $('seen').textContent = describe(labels);
      state.checking = false;
      if (state.done) return;
      if (isMatch(labels, state.queue[state.index])) {
        endRound(true, '🎉 Ketemu!');
      } else {
        setStatus('😅 Belum tepat, cari lagi!', 'fail');
        $('btn-photo').classList.remove('disabled');
      }
    } catch (err) {
      state.checking = false;
      setStatus('⚠️ ' + err.message, 'fail');
      if (!state.done) $('btn-photo').classList.remove('disabled');
    }
  }

  document.querySelectorAll('.choices').forEach((group) => {
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
      $(group.dataset.target).value = chip.dataset.value;
    });
  });
  $('btn-start').addEventListener('click', () => { sound('start'); startGame(); });
  $('btn-again').addEventListener('click', () => show('start'));
  $('btn-next').addEventListener('click', nextRound);
  $('btn-skip').addEventListener('click', () => endRound(false, '⏭️ Dilewati'));
  $('camera').addEventListener('change', onPhoto);
  $('btn-flip').addEventListener('click', switchCamera);
})();
