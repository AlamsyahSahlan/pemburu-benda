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
  { label: 'mouse',      name: 'Mouse',             emoji: '🖱️', hint: 'Mouse wireless dari tas laptop', level: 1 },
  { label: 'cup',        name: 'Tumbler / Gelas',   emoji: '🥤', hint: 'Tumbler, gelas, atau cup minuman', level: 1 },
  { label: 'handbag',    name: 'Tas Selempang / Tote', emoji: '👜', hint: 'Sling bag, tote bag, atau tas tangan', level: 1 },

  { label: 'keyboard',   name: 'Keyboard',          emoji: '⌨️', hint: 'Keyboard eksternal atau keyboard laptop', level: 2 },
  { label: 'scissors',   name: 'Gunting',           emoji: '✂️', hint: 'Sisa tugas maket atau kliping', level: 2 },
  { label: 'umbrella',   name: 'Payung',            emoji: '☂️', hint: 'Payung lipat andalan musim hujan', level: 2 },
  { label: 'tie',        name: 'Dasi',              emoji: '👔', hint: 'Buat yang habis presentasi atau sidang', level: 2 },
  { label: 'remote',     name: 'Pointer Presentasi', emoji: '🎛️', hint: 'Clicker / pointer untuk presentasi', level: 2 },
  { label: 'suitcase',   name: 'Koper',             emoji: '🧳', hint: 'Yang habis kelas langsung pulang kampung', level: 2 },

  { all: ['laptop', 'mouse'],       name: 'Laptop + Mouse',  emoji: '💻🖱️', hint: 'Setup nugas lengkap', level: 3 },
  { all: ['laptop', 'cell phone'],  name: 'Laptop + HP',     emoji: '💻📱', hint: 'Multitasking: Zoom sambil balas grup', level: 3 },
  { all: ['laptop', 'book'],        name: 'Laptop + Buku',   emoji: '💻📖', hint: 'Belajar hybrid', level: 3 },
  { all: ['laptop', 'cup'],         name: 'Laptop + Tumbler', emoji: '💻🥤', hint: 'Nugas ala anak kafe', level: 3 },
  { all: ['backpack', 'laptop'],    name: 'Ransel + Laptop', emoji: '🎒💻', hint: 'Isi wajib tas mahasiswa', level: 3 },
  { all: ['book', 'bottle'],        name: 'Buku + Botol',    emoji: '📖🧴', hint: 'Siap kuliah pagi', level: 3 },
  { all: ['backpack', 'bottle'],    name: 'Ransel + Botol',  emoji: '🎒🧴', hint: 'Siap berangkat ngampus', level: 3 },
  { all: ['cell phone', 'book'],    name: 'HP + Buku',       emoji: '📱📖', hint: 'Foto catatan teman sebelum ujian', level: 3 },
  { all: ['book', 'scissors'],      name: 'Buku + Gunting',  emoji: '📖✂️', hint: 'Tugas kliping dadakan', level: 3 },
  { all: ['backpack', 'umbrella'],  name: 'Ransel + Payung', emoji: '🎒☂️', hint: 'Siap menembus hujan ke kampus', level: 3 },

  // Nyeleneh: tetap perlengkapan mahasiswa, tapi banyak barang sekaligus dalam satu frame.
  { all: ['backpack', 'laptop', 'cell phone', 'book', 'bottle'], name: 'Bongkar Isi Tas', emoji: '🎒💻📱📖🧴',
    hint: 'Keluarkan SEMUA: ransel, laptop, HP, buku, botol, tunjukkan barengan! 🤣', level: 4 },
  { all: ['tie', 'laptop', 'remote'], name: 'Gaya Sidang Skripsi', emoji: '👔💻🎛️',
    hint: 'Dasi + laptop + pointer. Latihan sidang dari sekarang 😎', level: 4 }
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