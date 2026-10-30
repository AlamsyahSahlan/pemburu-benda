// Membuat sertifikat HTTPS lokal (self-signed) supaya kamera bisa dibuka dari HP.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const candidates = [
  'openssl',
  'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
  'C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe',
];
const openssl = candidates.find((c) => {
  try { execFileSync(c, ['version'], { stdio: 'ignore' }); return true; } catch { return false; }
});
if (!openssl) {
  console.error('OpenSSL tidak ditemukan. Install Git for Windows (sudah termasuk OpenSSL), lalu coba lagi.');
  process.exit(1);
}

const ips = Object.values(os.networkInterfaces()).flat()
  .filter((i) => i && i.family === 'IPv4').map((i) => i.address);
const san = ['DNS:localhost', ...ips.map((ip) => `IP:${ip}`)].join(',');

const dir = path.join(__dirname, '..', 'certs');
fs.mkdirSync(dir, { recursive: true });
execFileSync(openssl, [
  'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '825',
  '-keyout', path.join(dir, 'key.pem'), '-out', path.join(dir, 'cert.pem'),
  '-subj', '/CN=Pemburu Benda', '-addext', `subjectAltName=${san}`,
], { stdio: 'inherit' });

console.log('\nSertifikat dibuat di folder certs/ untuk:', san);
console.log('Jalankan "npm start" lalu buka alamat https://<IP-laptop>:3443 di HP.');
