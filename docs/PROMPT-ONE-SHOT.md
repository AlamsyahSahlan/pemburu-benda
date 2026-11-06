# Prompt Satu Kali Generate — Pemburu Benda: Edisi Kampus

**Cara pakai**
1. Buat folder kosong, misalnya `D:\pemburu-benda`, lalu buka folder itu di VS Code atau Antigravity.
2. Buka AI coding agent (GitHub Copilot Agent mode, Antigravity, Cursor, Claude Code, dan sejenisnya).
3. Salin **seluruh isi kotak di bawah**, tempel ke chat agent, lalu kirim. Cukup satu kali.
4. Setelah selesai: salin `.env.example` menjadi `.env`, isi `APILOGY_API_KEY`, lalu jalankan `npm start` dan buka http://localhost:3000.

---

````text
Kamu adalah senior full-stack engineer. Buat SELURUH proyek berikut sampai langsung bisa
dijalankan dengan `npm start`, dalam SATU kali kerja, tanpa bertanya balik. Tulis semua file
secara lengkap (jangan pakai placeholder "..."). Seluruh teks UI dalam Bahasa Indonesia
yang santai untuk mahasiswa.

# PROYEK: "Pemburu Benda: Edisi Kampus"
Game web untuk mahasiswa di kelas. Game memberi tantangan "Cari [BARANG] dalam 30 detik!".
Pemain mengeluarkan barang dari tas lalu mengangkatnya ke kamera. AI Object Detection
(Apilogy, Telkom AI DAG, model COCO 80 kelas) mengecek frame kamera ±1 detik sekali tanpa
perlu menekan tombol.

# ATURAN TEKNIS WAJIB
- Node.js >= 20.12, TANPA framework dan TANPA dependency npm (jangan pakai express/dotenv).
  Pakai node:http, node:https, fetch, FormData, Blob, AbortSignal.timeout, dan
  process.loadEnvFile bawaan.
- Frontend: HTML + CSS + JavaScript vanilla, tanpa build step.
- API key HANYA di server (.env). Browser tidak boleh memanggil Apilogy langsung.

# STRUKTUR FILE
package.json, server.js, .env.example, .gitignore, README.md,
public/index.html, public/style.css, public/objects.js, public/game.js,
scripts/make-cert.js

## package.json
name "pemburu-benda", version "2.0.0", private true, main "server.js",
scripts: { "start": "node server.js", "cert": "node scripts/make-cert.js" },
engines: { "node": ">=20.12" }.

## .env.example
APILOGY_API_KEY=
OBJECT_DETECTION_URL=https://telkom-ai-dag.api.apilogy.id/Object_Detection/0.0.2/images/detect_objects
CONF_THRES=0.45
PORT=3000
HTTPS_PORT=3443
DEBUG=

## .gitignore
node_modules/ .env certs/ *.pem *.log

# SERVER (server.js)
1. Jika file .env ada, panggil process.loadEnvFile(path .env).
2. Konstanta: PORT (3000), HTTPS_PORT (3443), API_KEY, DETECT_URL, CONF_THRES ('0.45'),
   MAX_UPLOAD = 8 MB, COCO = Set berisi 80 label COCO (person, bicycle, car, motorcycle,
   airplane, bus, train, truck, boat, traffic light, fire hydrant, stop sign, parking meter,
   bench, bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe, backpack,
   umbrella, handbag, tie, suitcase, frisbee, skis, snowboard, sports ball, kite,
   baseball bat, baseball glove, skateboard, surfboard, tennis racket, bottle, wine glass,
   cup, fork, knife, spoon, bowl, banana, apple, sandwich, orange, broccoli, carrot,
   hot dog, pizza, donut, cake, chair, couch, potted plant, bed, dining table, toilet, tv,
   laptop, mouse, remote, keyboard, cell phone, microwave, oven, toaster, sink,
   refrigerator, book, clock, vase, scissors, teddy bear, hair drier, toothbrush).
3. readBody(req): kumpulkan chunk. Jika > MAX_UPLOAD → reject Error('Foto terlalu besar')
   dan req.destroy().
4. extractLabels(node, out=new Map()) — parser rekursif yang toleran:
   - string yang termasuk COCO → out.set(label, null) jika belum ada
   - array → rekursi setiap elemen
   - objek → (a) jika field label/name/class/class_name/object/category berisi label COCO,
     simpan label itu dengan confidence dari node; (b) untuk setiap key yang termasuk COCO,
     simpan dengan confidence dari value-nya; lalu rekursi ke semua value.
   - Confidence dibaca dari field pertama yang numerik di antara conf_score, confidence,
     score, conf, probability, prob. Simpan confidence TERTINGGI per label.
   Contoh respons API: {"data":[{"laptop":{"bbox":[..],"conf_score":0.93}}]}
5. POST /api/detect:
   - API_KEY kosong → 500 {"error":"APILOGY_API_KEY belum diisi di file .env"}
   - body kosong → 400 {"error":"Foto kosong"}
   - Kirim multipart FormData field "file" (Blob image/jpeg, nama photo.jpg) ke DETECT_URL
     dengan query conf_thres=CONF_THRES, header x-api-key dan Accept: application/json,
     signal AbortSignal.timeout(20000).
   - Jika gagal: 401/403 → "API key ditolak. Cek APILOGY_API_KEY dan pastikan sudah
     subscribe Object Detection."; 429 → "Terlalu banyak foto, tunggu sebentar ya.";
     lainnya → "Object Detection error <status>". Balas 502 {error, detail}.
   - Jika sukses: 200 {"labels":[{"label","confidence"}], "ms": durasi, "raw": data}.
   - Jika DEBUG terisi, console.log respons mentah (maks 1000 karakter).
6. GET: sajikan file statis dari public/ ('/' → index.html). Cegah path traversal dengan
   path.normalize + startsWith(PUBLIC_DIR) → 403. MIME .html/.js/.css (utf-8),
   Cache-Control: no-cache. Jika tidak ada → 404.
7. Metode lain → 405. Bungkus semua handler dengan try/catch → 500 JSON. TimeoutError →
   "AI terlalu lama menjawab, coba lagi".
8. Hanya jika require.main === module: listen HTTP. Jika certs/key.pem & certs/cert.pem ada,
   jalankan juga HTTPS di HTTPS_PORT dan cetak "https://<IP-LAN>:<port>" untuk setiap IPv4
   non-internal. Jika tidak ada, cetak saran "npm run cert". Peringatkan jika API key kosong.
9. module.exports = { extractLabels }.

# scripts/make-cert.js
Cari openssl ('openssl', 'C:\Program Files\Git\usr\bin\openssl.exe',
'C:\Program Files\Git\mingw64\bin\openssl.exe'). Jika tidak ada, tampilkan pesan untuk
install Git for Windows lalu exit(1). Kumpulkan semua IPv4, bentuk SAN
"DNS:localhost,IP:...". Jalankan dengan execFileSync:
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 825 -keyout certs/key.pem
-out certs/cert.pem -subj "/CN=Pemburu Benda" -addext "subjectAltName=<SAN>".
Buat folder certs/ dulu. Cetak petunjuk setelah selesai.

# DATABASE BARANG (public/objects.js) — salin persis
Hanya perlengkapan mahasiswa. JANGAN tambahkan buah, makanan, hewan, atau perabot.
(Pulpen/pensil/penghapus/charger tidak ada di label COCO, jadi tidak bisa dipakai.)
window.TARGETS = [
  { label: 'cell phone', name: 'HP', emoji: '📱', hint: 'Yang lagi kamu pegang juga boleh 😏', level: 1 },
  { label: 'laptop', name: 'Laptop', emoji: '💻', hint: 'Buka setengah supaya layar & keyboard kelihatan', level: 1 },
  { label: 'bottle', name: 'Botol Minum', emoji: '🧴', hint: 'Tumbler, botol air mineral, atau botol teh', also: ['cup'], level: 1 },
  { label: 'book', name: 'Buku / Binder', emoji: '📖', hint: 'Buku catatan, binder, atau modul kuliah', level: 1 },
  { label: 'backpack', name: 'Tas Ransel', emoji: '🎒', hint: 'Angkat tasmu ke depan kamera', level: 1 },
  { label: 'mouse', name: 'Mouse', emoji: '🖱️', hint: 'Mouse wireless dari tas laptop', level: 1 },
  { label: 'cup', name: 'Tumbler / Gelas', emoji: '🥤', hint: 'Tumbler, gelas, atau cup minuman', level: 1 },
  { label: 'handbag', name: 'Tas Selempang / Tote', emoji: '👜', hint: 'Sling bag, tote bag, atau tas tangan', level: 1 },
  { label: 'keyboard', name: 'Keyboard', emoji: '⌨️', hint: 'Keyboard eksternal atau keyboard laptop', level: 2 },
  { label: 'scissors', name: 'Gunting', emoji: '✂️', hint: 'Sisa tugas maket atau kliping', level: 2 },
  { label: 'umbrella', name: 'Payung', emoji: '☂️', hint: 'Payung lipat andalan musim hujan', level: 2 },
  { label: 'tie', name: 'Dasi', emoji: '👔', hint: 'Buat yang habis presentasi atau sidang', level: 2 },
  { label: 'remote', name: 'Pointer Presentasi', emoji: '🎛️', hint: 'Clicker / pointer untuk presentasi', level: 2 },
  { label: 'suitcase', name: 'Koper', emoji: '🧳', hint: 'Yang habis kelas langsung pulang kampung', level: 2 },
  { all: ['laptop', 'mouse'], name: 'Laptop + Mouse', emoji: '💻🖱️', hint: 'Setup nugas lengkap', level: 3 },
  { all: ['laptop', 'cell phone'], name: 'Laptop + HP', emoji: '💻📱', hint: 'Multitasking: Zoom sambil balas grup', level: 3 },
  { all: ['laptop', 'book'], name: 'Laptop + Buku', emoji: '💻📖', hint: 'Belajar hybrid', level: 3 },
  { all: ['laptop', 'cup'], name: 'Laptop + Tumbler', emoji: '💻🥤', hint: 'Nugas ala anak kafe', level: 3 },
  { all: ['backpack', 'laptop'], name: 'Ransel + Laptop', emoji: '🎒💻', hint: 'Isi wajib tas mahasiswa', level: 3 },
  { all: ['book', 'bottle'], name: 'Buku + Botol', emoji: '📖🧴', hint: 'Siap kuliah pagi', level: 3 },
  { all: ['backpack', 'bottle'], name: 'Ransel + Botol', emoji: '🎒🧴', hint: 'Siap berangkat ngampus', level: 3 },
  { all: ['cell phone', 'book'], name: 'HP + Buku', emoji: '📱📖', hint: 'Foto catatan teman sebelum ujian', level: 3 },
  { all: ['book', 'scissors'], name: 'Buku + Gunting', emoji: '📖✂️', hint: 'Tugas kliping dadakan', level: 3 },
  { all: ['backpack', 'umbrella'], name: 'Ransel + Payung', emoji: '🎒☂️', hint: 'Siap menembus hujan ke kampus', level: 3 },
  { all: ['backpack', 'laptop', 'cell phone', 'book', 'bottle'], name: 'Bongkar Isi Tas', emoji: '🎒💻📱📖🧴', hint: 'Keluarkan SEMUA: ransel, laptop, HP, buku, botol, tunjukkan barengan! 🤣', level: 4 },
  { all: ['tie', 'laptop', 'remote'], name: 'Gaya Sidang Skripsi', emoji: '👔💻🎛️', hint: 'Dasi + laptop + pointer. Latihan sidang dari sekarang 😎', level: 4 }
];
window.ALIASES = { cup: ['cup', 'wine glass'] };
window.LABEL_ID = terjemahan Bahasa Indonesia untuk ke-80 label COCO, contoh:
  person 'orang', cell phone 'HP', laptop 'laptop', cup 'gelas', bottle 'botol',
  book 'buku', backpack 'tas ransel', handbag 'tas tangan', remote 'remot', tie 'dasi',
  suitcase 'koper', umbrella 'payung', wine glass 'gelas kaki', dining table 'meja'
  (lengkapi semuanya).

# UI (public/index.html) — satu halaman, 3 <section class="screen">, hanya 1 yang tampil
- <html lang="id">, meta viewport (viewport-fit=cover), theme-color #7b2ff7, font Google
  "Fredoka" 400/600/700.
- Latar: 8 emoji melayang (.bg span, aria-hidden).
- #screen-start: maskot 🕵️, judul "Pemburu<br><span>Benda</span>", lead "Bongkar tasmu,
  angkat barangnya ke depan kamera, dan biarkan AI mengecek! 🔍".
  "Pilih Level": .choices[data-target=level] berisi 5 chip button data-value:
  1 🐣 Mudah (active), 2 🦊 Sedang, 3 🦁 Sulit, 4 🤪 Nyeleneh, 0 🎲 Campur; + input hidden #level.
  "Jumlah Ronde": .choices.small[data-target=rounds] berisi 3, 5 (active), 10; + input hidden #rounds.
  Tombol #btn-start "🚀 Mulai Berburu!".
- #screen-play: HUD pill 🎯 #round-no/#round-total, pill .time-pill ⏱️ #time-left, pill ⭐ #score;
  .timer > #timer-bar; kartu target ("Ayo cari…", #target-emoji, #target, #hint);
  #cam-wrap berisi <video id="video" autoplay playsinline muted>, #scan (4 <i> sudut +
  <b class="laser">), badge "● Angkat benda ke depan kamera", tombol #btn-flip 🔄 (hidden);
  <img id="preview" hidden>; <label id="btn-photo" class="btn btn-photo" hidden>📷 Foto
  Sekarang <input id="camera" type="file" accept="image/*" capture="environment" hidden></label>;
  #status, #seen, #btn-next "Lanjut ➜" (hidden), #btn-skip "Lewati ⏭️".
- #screen-end: 🏆, judul, #stars, "Skor kamu", #final-score, ul#summary, #btn-again "🔁 Main Lagi".
- #confetti. Muat objects.js lalu game.js.

# GAYA (public/style.css)
Token: --purple #7b2ff7, --pink #f107a3, --yellow #ffd23f, --green #22c55e, --blue #3b82f6,
--red #ef4444, --ink #2b2140, --muted #7a6f8f, --radius 28px. [hidden]{display:none!important}.
Body: gradien 135° ungu→pink→oranye (#ff9a3c) yang bergerak pelan, kartu putih di tengah
lebar min(440px,100%), radius 28, bayangan tebal. Animasi: popIn per layar, maskot naik-turun,
judul teks gradien. .choices grid 5 kolom, .choices.small 3 kolom; .chip.active border ungu +
naik. HUD berupa pill; .time-pill.warn berdenyut merah; #timer-bar hijau, .warn merah.
Kamera: #video tinggi 280px object-fit cover, radius 22; sudut .scan kuning, garis .laser
kuning bergerak naik-turun; .scan.hit hijau; #video.mirror scaleX(-1). Tombol besar membulat
dengan bayangan bawah (gaya 3D). .status.ok hijau (bounce), .fail merah. .shake untuk getar.
Konfeti jatuh (keyframes fall). Ringkasan list hijau/merah. @media (max-width:380px) perkecil
font. @media (prefers-reduced-motion) matikan animasi. Harus rapi dan responsif di HP.

# LOGIKA (public/game.js) — IIFE, tanpa global baru
Konstanta: ROUND_SECONDS 30, SCAN_GAP_MS 600, MIN_CONF 0.5, CONFIRM_FRAMES 2.
state: queue, index, score, timeLeft, timer, checking, done, results, live, stream,
round (token), streak, facing.
- canLive(): isSecureContext && getUserMedia tersedia.
- startCamera(): facingMode ideal dari localStorage 'facing' (default 'environment'),
  1280x720 ideal, audio false. Tampilkan #btn-flip jika ada >= 2 videoinput. Kamera depan
  diberi kelas .mirror. switchCamera() menukar kamera; jika gagal, kembali ke kamera lama.
- startGame(): pool = level==0 ? semua : filter level; shuffle Fisher–Yates; slice(rounds);
  live = await startCamera(); tampilkan layar main; startRound().
- startRound(): round++, timeLeft=30, done=false, streak=0, isi kartu target (nama
  UPPERCASE, '💡 '+hint), sembunyikan cam-wrap jika !live, tampilkan #btn-photo jika !live,
  setInterval(tick,1000); jika live → scanLoop(round).
- tick(): jika done, atau (checking && !live), jangan kurangi. Saat <= 10 detik: kelas warn
  + bunyi tik. Saat 0 → endRound(false,'⏰ Waktu habis!').
- isMatch(labels,target): seen(l) = ada label l dengan confidence null atau >= MIN_CONF;
  accepts(l) = ALIASES[l] || [l]; required = target.all || [target.label];
  return required.every(req => [...accepts(req), ...(target.also||[])].some(seen)).
- describe(labels): buang 'person', terjemahkan dengan LABEL_ID, hapus duplikat →
  '👀 AI melihat: a, b' atau '🤔 AI belum melihat benda apa pun.'
- grabFrame(): video → canvas, sisi terpanjang 640 → JPEG 0.8 Blob.
- detect(blob): POST /api/detect Content-Type image/jpeg; jika !ok lempar Error(data.error)
  dengan .status.
- scanLoop(round): selama state.round===round && !done: frame → checking=true → detect →
  tampilkan describe → jika cocok: streak++; jika streak>=2 → preview foto, .scan.hit,
  endRound(true,'🎉 Ketemu!'); jika belum → '👀 Sepertinya ketemu… tahan sebentar!';
  jika tidak cocok → streak=0, '🔍 Mencari...'. Jika error: tampilkan '⚠️ '+pesan; jika
  status 500 atau pesan mengandung 'API key' → hentikan loop; selain itu tunggu 2 detik.
  finally checking=false; tunggu SCAN_GAP_MS.
- Mode cadangan onPhoto: resize file ke 1024 px, tampilkan preview, detect, cocok →
  endRound(true) atau '😅 Belum tepat, cari lagi!'. Timer berhenti selama checking.
- endRound(success,msg): idempoten. Poin = 100 + timeLeft*10. Simpan ke results. Berhasil:
  suara menang + konfeti. Gagal: suara kalah + shake. Sembunyikan Lewati, tampilkan Lanjut
  ('Lihat Skor 🏆' di ronde terakhir).
- endGame(): stopCamera, bintang 3 (semua berhasil) / 2 (>=50%) / 1 (>=1) / 0 dengan pesan
  'Pemburu Hebat! 🎉' / 'Bagus sekali! 👏' / 'Ayo coba lagi! 🙂' / 'Jangan menyerah! 💪';
  judul 'Hebat!' jika >= 2 bintang, selain itu 'Selesai!'; ringkasan per ronde (emoji, nama,
  +poin atau ❌) diisi lewat textContent (anti-XSS).
- sound(kind) dengan Web Audio: win [523,659,784,1047] square, lose [392,330,262]
  triangle, tick [880] pendek & pelan, start [440,660]. Bungkus try/catch.
- confetti(): 80 partikel warna-warni, hapus setelah 3,8 detik.
- Event: chip (delegasi) → set .active + input hidden; btn-start (bunyi start), btn-again,
  btn-next, btn-skip ('⏭️ Dilewati'), #camera change, btn-flip.

# README.md
Judul, deskripsi Edisi Kampus, fitur, tabel teknologi, struktur folder, langkah ambil API
key Apilogy (subscribe Object Detection telkom_ai_dag Free Plan → My Account → Applications
→ Details → Key-Auth → Generate Key), isi .env, `npm start`, main dari HP (`npm run cert`,
buka https://IP:3443, Advanced → Proceed, izinkan kamera), aturan main, tabel level termasuk
level Nyeleneh, tabel variabel .env, dan troubleshooting singkat.

# SELESAI JIKA
- `npm start` jalan tanpa error dan http://localhost:3000 menampilkan Layar Mulai dengan
  5 chip level.
- `node -e "console.log([...require('./server').extractLabels({data:[{laptop:{conf_score:0.9}}]})])"`
  mencetak [ [ 'laptop', 0.9 ] ].
- Tidak ada API key di kode frontend.
Setelah selesai, jalankan perintah verifikasi di atas, lalu tampilkan ringkasan file yang dibuat.
````
