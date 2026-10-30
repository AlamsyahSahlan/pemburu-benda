// Daftar benda untuk "Pemburu Benda" - hanya benda yang bisa diangkat dan ditunjukkan ke kamera.
// label  : nama kelas dari API Object Detection (harus persis sama)
// all    : untuk tantangan beberapa benda sekaligus; semua label harus terlihat bersamaan
// also   : label lain yang juga dianggap benar
// level  : 1 = mudah, 2 = sedang, 3 = sulit (2 benda sekaligus)
window.TARGETS = [
  { label: 'cup',           name: 'Gelas / Cangkir', emoji: '☕', hint: 'Gelas minum atau cangkir teh', level: 1 },
  { label: 'bottle',        name: 'Botol',           emoji: '🧴', hint: 'Botol minum, botol kecap, botol sabun', level: 1 },
  { label: 'book',          name: 'Buku',            emoji: '📖', hint: 'Buku cerita atau buku pelajaran', level: 1 },
  { label: 'spoon',         name: 'Sendok',          emoji: '🥄', hint: 'Di laci dapur atau rak piring', level: 1 },
  { label: 'bowl',          name: 'Mangkuk',         emoji: '🥣', hint: 'Di rak piring dapur', level: 1 },
  { label: 'cell phone',    name: 'HP',              emoji: '📱', hint: 'Pinjam HP Ayah atau Ibu', level: 1 },
  { label: 'remote',        name: 'Remot',           emoji: '🎛️', hint: 'Remot TV atau remot AC', level: 1 },
  { label: 'fork',          name: 'Garpu',           emoji: '🍴', hint: 'Teman si sendok', level: 1 },
  { label: 'toothbrush',    name: 'Sikat Gigi',      emoji: '🪥', hint: 'Di kamar mandi', level: 1 },
  { label: 'scissors',      name: 'Gunting',         emoji: '✂️', hint: 'Di kotak alat tulis (hati-hati ya!)', level: 1 },

  { label: 'laptop',        name: 'Laptop',          emoji: '💻', hint: 'Komputer lipat', level: 2 },
  { label: 'mouse',         name: 'Mouse Komputer',  emoji: '🖱️', hint: 'Bukan tikus sungguhan ya!', level: 2 },
  { label: 'backpack',      name: 'Tas Ransel',      emoji: '🎒', hint: 'Tas sekolah', level: 2 },
  { label: 'sports ball',   name: 'Bola',            emoji: '⚽', hint: 'Bola sepak, bola basket, bola apa saja', level: 2 },
  { label: 'handbag',       name: 'Tas Tangan',      emoji: '👜', hint: 'Tas milik Ibu', level: 2 },
  { label: 'clock',         name: 'Jam Weker',       emoji: '⏰', hint: 'Jam meja atau jam weker (bukan jam tangan)', level: 2 },
  { label: 'tennis racket', name: 'Raket',           emoji: '🏸', hint: 'Raket badminton atau raket tenis', level: 2 },
  { label: 'potted plant',  name: 'Tanaman Pot',     emoji: '🪴', hint: 'Tanaman di pot kecil yang bisa diangkat', level: 2 },
  { label: 'vase',          name: 'Vas Bunga',       emoji: '🏺', hint: 'Vas kecil di meja (pegang hati-hati!)', level: 2 },
  { label: 'tie',           name: 'Dasi',            emoji: '👔', hint: 'Dasi sekolah atau dasi Ayah', level: 2 },

  { all: ['spoon', 'bowl'],          name: 'Sendok + Mangkuk', emoji: '🥄🥣', hint: 'Tunjukkan dua-duanya sekaligus!', level: 3 },
  { all: ['spoon', 'fork'],          name: 'Sendok + Garpu',   emoji: '🥄🍴', hint: 'Pasangan alat makan', level: 3 },
  { all: ['cup', 'bottle'],          name: 'Gelas + Botol',    emoji: '☕🧴', hint: 'Siap-siap minum!', level: 3 },
  { all: ['cell phone', 'remote'],   name: 'HP + Remot',       emoji: '📱🎛️', hint: 'Dua benda bertombol', level: 3 },
  { all: ['book', 'scissors'],       name: 'Buku + Gunting',   emoji: '📖✂️', hint: 'Perlengkapan sekolah', level: 3 },
  { all: ['laptop', 'mouse'],        name: 'Laptop + Mouse',   emoji: '💻🖱️', hint: 'Pasangan komputer', level: 3 },
  { all: ['toothbrush', 'cup'],      name: 'Sikat Gigi + Gelas', emoji: '🪥☕', hint: 'Waktunya gosok gigi!', level: 3 },
  { all: ['backpack', 'book'],       name: 'Tas Ransel + Buku', emoji: '🎒📖', hint: 'Siap berangkat sekolah', level: 3 },
  { all: ['sports ball', 'bottle'],  name: 'Bola + Botol',     emoji: '⚽🧴', hint: 'Siap olahraga!', level: 3 },
  { all: ['clock', 'book'],          name: 'Jam Weker + Buku', emoji: '⏰📖', hint: 'Waktunya belajar', level: 3 }
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