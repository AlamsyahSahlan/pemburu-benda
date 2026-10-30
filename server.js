const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  process.loadEnvFile(path.join(__dirname, '.env'));
}

const PORT = Number(process.env.PORT) || 3000;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 3443;
const API_KEY = process.env.APILOGY_API_KEY || '';
const DETECT_URL = process.env.OBJECT_DETECTION_URL ||
  'https://telkom-ai-dag.api.apilogy.id/Object_Detection/0.0.2/images/detect_objects';
const CONF_THRES = process.env.CONF_THRES || '0.45';
const MAX_UPLOAD = 8 * 1024 * 1024;

const COCO = new Set(['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep',
  'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
  'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
  'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
  'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
  'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']);

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_UPLOAD) {
        reject(new Error('Foto terlalu besar'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Response API: {"data":[{"cat":{"bbox":[...],"conf_score":0.96}}, ...]}.
// Bentuk lain (mis. {"label":"cat","score":0.9}) tetap didukung untuk berjaga-jaga.
const CONF_KEYS = ['conf_score', 'confidence', 'score', 'conf', 'probability', 'prob'];

function readConf(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const v = CONF_KEYS.map((k) => Number(obj[k])).find((n) => Number.isFinite(n));
  return v ?? null;
}

function addLabel(out, label, conf) {
  const prev = out.get(label);
  out.set(label, conf != null && (prev == null || conf > prev) ? conf : prev ?? null);
}

function extractLabels(node, out = new Map()) {
  if (node == null) return out;
  if (typeof node === 'string') {
    const s = node.trim().toLowerCase();
    if (COCO.has(s) && !out.has(s)) out.set(s, null);
  } else if (Array.isArray(node)) {
    node.forEach((n) => extractLabels(n, out));
  } else if (typeof node === 'object') {
    const labelKey = ['label', 'name', 'class', 'class_name', 'object', 'category'].find(
      (k) => typeof node[k] === 'string' && COCO.has(node[k].trim().toLowerCase()));
    if (labelKey) addLabel(out, node[labelKey].trim().toLowerCase(), readConf(node));
    for (const [k, v] of Object.entries(node)) {
      const key = k.trim().toLowerCase();
      if (COCO.has(key)) addLabel(out, key, readConf(v));
      extractLabels(v, out);
    }
  }
  return out;
}

async function handleDetect(req, res) {
  if (!API_KEY) {
    return sendJson(res, 500, { error: 'APILOGY_API_KEY belum diisi di file .env' });
  }
  const buf = await readBody(req);
  if (!buf.length) return sendJson(res, 400, { error: 'Foto kosong' });

  const form = new FormData();
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), 'photo.jpg');

  const url = new URL(DETECT_URL);
  url.searchParams.set('conf_thres', CONF_THRES);

  const started = Date.now();
  const apiRes = await fetch(url, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, Accept: 'application/json' },
    body: form,
    signal: AbortSignal.timeout(20000),
  });
  const raw = await apiRes.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = raw; }

  if (!apiRes.ok) {
    console.error('[DETECT] HTTP', apiRes.status, raw.slice(0, 500));
    const msg = apiRes.status === 401 || apiRes.status === 403
      ? 'API key ditolak. Cek APILOGY_API_KEY dan pastikan sudah subscribe Object Detection.'
      : apiRes.status === 429 ? 'Terlalu banyak foto, tunggu sebentar ya.' : `Object Detection error ${apiRes.status}`;
    return sendJson(res, 502, { error: msg, detail: data });
  }

  const labels = [...extractLabels(data)].map(([label, confidence]) => ({ label, confidence }));
  if (process.env.DEBUG) console.log('[DETECT]', JSON.stringify(data).slice(0, 1000));
  sendJson(res, 200, { labels, ms: Date.now() - started, raw: data });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); return res.end();
  }
  fs.readFile(file, (err, content) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  });
}

const server = http.createServer(handler);

async function handler(req, res) {
  try {
    if (req.method === 'POST' && req.url === '/api/detect') return await handleDetect(req, res);
    if (req.method === 'GET') return serveStatic(req, res);
    res.writeHead(405); res.end();
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.name === 'TimeoutError' ? 'AI terlalu lama menjawab, coba lagi' : err.message || 'Server error' });
  }
}

function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
}

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Pemburu Benda jalan di http://localhost:${PORT}`);
    if (!API_KEY) console.warn('PERINGATAN: APILOGY_API_KEY belum diisi di .env');
  });

  // Kamera langsung di HP hanya diizinkan browser lewat HTTPS.
  const keyFile = path.join(__dirname, 'certs', 'key.pem');
  const certFile = path.join(__dirname, 'certs', 'cert.pem');
  if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    https.createServer({ key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }, handler)
      .listen(HTTPS_PORT, () => {
        console.log('Untuk HP (Wi-Fi yang sama), buka:');
        lanAddresses().forEach((ip) => console.log(`  https://${ip}:${HTTPS_PORT}`));
      });
  } else {
    console.log('Untuk main dari HP dengan kamera langsung, jalankan dulu: npm run cert');
  }
}

module.exports = { extractLabels };
