// Membuat src/environment.ts dari src/environment.template.ts.
//
// Sumber nilai (yang lebih atas menang):
//   1. variabel lingkungan sungguhan (mis. Variables di Railway)
//   2. file .env di root proyek (hanya untuk lokal, tidak di-commit)
//
// Dijalankan otomatis oleh npm sebelum build/dev/watch/test (hook "pre...").
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = resolve(root, 'src/environment.template.ts');
const outputPath = resolve(root, 'src/environment.ts');

/** Boleh kosong: aplikasi tidak memakai Analytics */
const OPTIONAL = new Set(['FIREBASE_MEASUREMENT_ID']);

/**
 * Karakter yang diizinkan di nilai. Nilai ditulis ke dalam kode TypeScript,
 * jadi tanda kutip atau backslash akan merusak (atau membajak) file hasilnya.
 */
const SAFE_VALUE = /^[A-Za-z0-9_\-.:/@]*$/;

/** Baca KEY=VALUE dari .env. Variabel yang sudah ada di lingkungan tidak ditimpa. */
function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue; // baris kosong atau komentar (#)
    let value = match[2];
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

function fail(message) {
  console.error(`\n[environment] ${message}\n`);
  process.exit(1);
}

loadDotEnv(resolve(root, '.env'));

if (!existsSync(templatePath)) fail(`Template tidak ditemukan: ${templatePath}`);
const template = readFileSync(templatePath, 'utf8');

// Buang komentar penjelasan di awal template, supaya teks di dalamnya tidak dikira placeholder
const body = template.replace(/^\/\/ TEMPLATE[\s\S]*?\n(?=const environment)/, '');

const names = [...new Set([...body.matchAll(/__([A-Z0-9_]+)__/g)].map((m) => m[1]))];
const missing = names.filter((n) => !OPTIONAL.has(n) && !process.env[n]);

if (missing.length > 0) {
  // Lokal: kalau file hasil sudah ada, pakai saja. Di CI/Railway file itu tidak ada, jadi gagal dengan jelas.
  if (existsSync(outputPath)) {
    console.log('[environment] Variabel belum lengkap; memakai src/environment.ts yang sudah ada.');
    process.exit(0);
  }
  fail(
    `src/environment.ts belum ada dan variabel berikut belum diisi:\n  ${missing.join('\n  ')}\n\n` +
      'Lokal : salin .env.example menjadi .env lalu isi nilainya.\n' +
      'Railway: tambahkan di tab Variables milik service.',
  );
}

const unsafe = names.filter((n) => !SAFE_VALUE.test(process.env[n] ?? ''));
if (unsafe.length > 0) {
  fail(`Nilai berisi karakter yang tidak diizinkan (tanda kutip, spasi, backslash, dll.): ${unsafe.join(', ')}`);
}

const output = body.replace(/__([A-Z0-9_]+)__/g, (_, name) => process.env[name] ?? '');

writeFileSync(
  outputPath,
  '// DIBUAT OTOMATIS oleh scripts/generate-environment.mjs. JANGAN di-commit dan jangan diedit (akan ditimpa).\n' + output,
);
console.log(`[environment] src/environment.ts dibuat dari template (${names.length} variabel).`);
