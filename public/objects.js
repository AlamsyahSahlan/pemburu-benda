// Daftar benda "Pemburu Benda: Edisi Kampus" - barang yang biasa dibawa mahasiswa ke kelas.
// label  : nama kelas dari API Object Detection (harus persis sama, 80 label COCO)
// all    : untuk tantangan beberapa benda sekaligus; semua label harus terlihat bersamaan
// also   : label lain yang juga dianggap benar
// level  : 1 = mudah, 2 = sedang, 3 = sulit (2 benda sekaligus), 4 = nyeleneh
window.TARGETS = [
  { label: 'cell phone', name: 'HP',                emoji: '📱', hint: 'Yang lagi kamu pegang juga boleh 😏', level: 1 },
  { label: 'laptop',     name: 'Laptop',            emoji: '💻', hint: 'Buka setengah supaya layar & keyboard kelihatan', level: 1 },
  { label: 'bottle',     name: 'Botol Minum',       emoji: '🧴', hint: 'Tumbler, botol air mineral, atau botol teh', also: ['cup'], level: 1 },
  { label: 'book',       name: 'Buku / Binder',     emoji: '📖', hint: 'Buku catatan, binder, atau modul kuliah', level: 1 },
  { label: 'backpack',   name: 'Tas Ransel',        emoji: '🎒', hint: 'Angkat tasmu ke depan kamera', level: 1 },
  { label: 'cup',        name: 'Cup Kopi / Gelas',  emoji: '☕', hint: 'Cup kopi, es teh, atau gelas plastik', level: 1 },
  { label: 'mouse',      name: 'Mouse',             emoji: '🖱️', hint: 'Mouse wireless dari tas laptop', level: 1 },
  { label: 'keyboard',   name: 'Keyboard',          emoji: '⌨️', hint: 'Keyboard eksternal atau keyboard laptop', level: 1 },
  { label: 'handbag',    name: 'Tas Selempang / Tote', emoji: '👜', hint: 'Sling bag, tote bag, atau tas tangan', level: 1 },
  { label: 'umbrella',   name: 'Payung',            emoji: '☂️', hint: 'Payung lipat andalan musim hujan', level: 1 },

  { label: 'scissors',    name: 'Gunting',           emoji: '✂️', hint: 'Sisa tugas maket atau kliping', level: 2 },
  { label: 'spoon',       name: 'Sendok',            emoji: '🥄', hint: 'Sendok dari kotak bekal', level: 2 },
  { label: 'fork',        name: 'Garpu',             emoji: '🍴', hint: 'Teman si sendok di kotak bekal', level: 2 },
  { label: 'banana',      name: 'Pisang',            emoji: '🍌', hint: 'Bekal sehat anak kos', level: 2 },
  { label: 'apple',       name: 'Apel',              emoji: '🍎', hint: 'Camilan sehat sebelum kuis', level: 2 },
  { label: 'orange',      name: 'Jeruk',             emoji: '🍊', hint: 'Jeruk bekal, jangan dikupas dulu', level: 2 },
  { label: 'sandwich',    name: 'Roti Isi',          emoji: '🥪', hint: 'Roti sarapan dari minimarket', level: 2 },
  { label: 'donut',       name: 'Donat',             emoji: '🍩', hint: 'Donat titipan teman (jangan dimakan dulu!)', level: 2 },
  { label: 'teddy bear',  name: 'Boneka',            emoji: '🧸', hint: 'Boneka kecil atau gantungan kunci boneka', level: 2 },
  { label: 'tie',         name: 'Dasi',              emoji: '👔', hint: 'Buat yang habis presentasi atau sidang', level: 2 },
  { label: 'sports ball', name: 'Bola',              emoji: '⚽', hint: 'Anak UKM futsal atau basket pasti bawa', level: 2 },
  { label: 'toothbrush',  name: 'Sikat Gigi',        emoji: '🪥', hint: 'Anak kos yang nginep di kampus', level: 2 },
  { label: 'remote',      name: 'Pointer / Remot',   emoji: '🎛️', hint: 'Pointer presentasi atau remot AC kelas', level: 2 },
  { label: 'suitcase',    name: 'Koper',             emoji: '🧳', hint: 'Yang habis kelas langsung pulang kampung', level: 2 },

  { all: ['laptop', 'mouse'],       name: 'Laptop + Mouse',  emoji: '💻🖱️', hint: 'Setup nugas lengkap', level: 3 },
  { all: ['laptop', 'cell phone'],  name: 'Laptop + HP',     emoji: '💻📱', hint: 'Multitasking: Zoom sambil balas grup', level: 3 },
  { all: ['laptop', 'cup'],         name: 'Laptop + Kopi',   emoji: '💻☕', hint: 'Nugas ala anak kafe', level: 3 },
  { all: ['laptop', 'book'],        name: 'Laptop + Buku',   emoji: '💻📖', hint: 'Belajar hybrid', level: 3 },
  { all: ['book', 'bottle'],        name: 'Buku + Botol',    emoji: '📖🧴', hint: 'Siap kuliah pagi', level: 3 },
  { all: ['backpack', 'umbrella'],  name: 'Ransel + Payung', emoji: '🎒☂️', hint: 'Siap menembus hujan ke kampus', level: 3 },
  { all: ['banana', 'bottle'],      name: 'Pisang + Botol',  emoji: '🍌🧴', hint: 'Bekal hemat akhir bulan', level: 3 },
  { all: ['spoon', 'fork'],         name: 'Sendok + Garpu',  emoji: '🥄🍴', hint: 'Alat makan bekal', level: 3 },
  { all: ['sandwich', 'cup'],       name: 'Roti + Kopi',     emoji: '🥪☕', hint: 'Sarapan sambil kelas pagi', level: 3 },
  { all: ['book', 'scissors'],      name: 'Buku + Gunting',  emoji: '📖✂️', hint: 'Tugas kliping dadakan', level: 3 },

  // Nyeleneh: mustahil dibawa ke kelas, jadi pemain harus kreatif (gambar di layar HP teman juga dideteksi AI).
  { label: 'refrigerator', name: 'Kulkas', emoji: '🧊', hint: 'Bawa kulkas ke kelas?! 😱 Gambar kulkas di layar HP teman juga dihitung', level: 4 },
  { all: ['elephant', 'refrigerator'], name: 'Gajah + Kulkas', emoji: '🐘🧊',
    hint: 'Teka-teki klasik: gimana masukin gajah ke kulkas? Tunjukkan dua-duanya sekaligus! 🤣', level: 4 }
];

// Label yang dianggap sama oleh game.
window.ALIASES = { cup: ['cup', 'wine glass'] };

// Terjemahan semua label supaya pemain tahu apa yang dilihat AI.
window.LABEL_ID = {
  person: 'orang', bicycle: 'sepeda', car: 'mobil', motorcycle: 'motor', airplane: 'pesawat', bus: 'bus',
  train: 'kereta', truck: 'truk', boat: 'perahu', 'traffic light': 'lampu lalu lintas', 'fire hydrant': 'hidran',
  'stop sign': 'rambu stop', 'parking meter': 'meteran parkir', bench: 'bangku', bird: 'burung', cat: 'kucing',
  dog: 'anjing', horse: 'kuda', sheep: 'domba', cow: 'sapi', elephant: 'gajah', bear: 'beruang', zebra: 'zebra',
  giraffe: 'jerapah', backpack: 'tas ransel', umbrella: 'payung', handbag: 'tas tangan', tie: 'dasi',
  suitcase: 'koper', frisbee: 'frisbee', skis: 'ski', snowboard: 'snowboard', 'sports ball': 'bola',
  kite: 'layang-layang', 'baseball bat': 'tongkat bisbol', 'baseball glove': 'sarung tangan bisbol',
  skateboard: 'skateboard', surfboard: 'papan selancar', 'tennis racket': 'raket', bottle: 'botol',
  'wine glass': 'gelas kaki', cup: 'gelas', fork: 'garpu', knife: 'pisau', spoon: 'sendok', bowl: 'mangkuk',
  banana: 'pisang', apple: 'apel', sandwich: 'roti isi', orange: 'jeruk', broccoli: 'brokoli', carrot: 'wortel',
  'hot dog': 'hot dog', pizza: 'pizza', donut: 'donat', cake: 'kue', chair: 'kursi', couch: 'sofa',
  'potted plant': 'tanaman pot', bed: 'kasur', 'dining table': 'meja', toilet: 'kloset', tv: 'TV',
  laptop: 'laptop', mouse: 'mouse', remote: 'remot', keyboard: 'keyboard', 'cell phone': 'HP',
  microwave: 'microwave', oven: 'oven', toaster: 'pemanggang roti', sink: 'wastafel', refrigerator: 'kulkas',
  book: 'buku', clock: 'jam', vase: 'vas', scissors: 'gunting', 'teddy bear': 'boneka',
  'hair drier': 'pengering rambut', toothbrush: 'sikat gigi'
};