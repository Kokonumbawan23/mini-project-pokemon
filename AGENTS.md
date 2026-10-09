# AGENTS.md — Mini App Pokemon

Panduan untuk AI agent (dan developer) yang bekerja di repo ini. Baca ini sebelum mengubah kode.

## Ringkasan

Aplikasi Angular 19 untuk menjelajah Pokémon (data dari [PokeAPI](https://pokeapi.co)), menambahkannya ke keranjang, lalu checkout. Pesanan disimpan di Firebase Realtime Database; login/register memakai Firebase Auth. Project ini berasal dari materi training (nama internal masih `training-day-1`).

## Stack

| Area | Teknologi |
|---|---|
| Framework | Angular 19, **NgModule-based** (`standalone: false` di semua komponen) |
| Rendering | SSR + prerender (`@angular/ssr`, Express di `src/server.ts`) |
| State | NgRx Store (feature `cart`), Store DevTools hanya saat development; Signals untuk toast |
| Auth | `@angular/fire/auth` (email + password) |
| Database | Firebase Realtime Database via REST (`HttpClient`) |
| HTTP | `HttpClient` untuk PokeAPI & Realtime DB; `PokemonService` meng-cache respons di memori |
| Styling | Tailwind CSS 3 + CSS per komponen, Font Awesome via CDN, Google Fonts (Archivo, Atkinson Hyperlegible) |
| Test | Karma + Jasmine |

## Perintah

```bash
npm run dev    # ng serve (development) → http://localhost:4200
npm run build  # build production (SSR + prerender) ke dist/training-day-1
npm start      # JALANKAN HASIL BUILD: node dist/training-day-1/server/server.mjs → http://localhost:4000 (atau $PORT)
npm test       # Karma
```

`start` sengaja menjalankan server production (konvensi Railway dan kebanyakan PaaS: `build` lalu `start`). Untuk development pakai `npm run dev`. `npm start` mengharuskan `npm run build` dijalankan lebih dulu.

Belum ada lint/format script (tidak ada ESLint/Prettier di `package.json`).

## Struktur

```
src/
├── main.ts / main.server.ts / server.ts   # entry browser, SSR, Express
├── environment.template.ts                # TEMPLATE config Firebase (placeholder, di-commit)
├── environment.ts                         # DIBUAT OTOMATIS dari template + .env/variabel lingkungan; TIDAK di-commit
└── app/
    ├── app.module.ts                      # root module: Store, Firebase, HttpClient, komponen shell
    ├── app-routing.module.ts              # route root
    ├── components/                        # SEMUA komponen, flat (termasuk milik feature module)
    │   ├── auth/                          # login/register  → /auth
    │   ├── pokemon-layout/                # shell (navbar + outlet), class: HomeLayoutComponent
    │   ├── navbar/                        # top bar (Pokédex, Orders, Cart, Log out)
    │   ├── cart/                          # → /cart
    │   ├── checkout/                      # → /checkout
    │   ├── pokemon-list/                  # → /pokemon, tampilan binder 3×3 (PokemonModule)
    │   ├── tcg-card/                      #   kartu TCG presentational, dipakai list & detail
    │   ├── pokemon-detail/                # → /pokemon/detail/:name
    │   ├── pokemon-forms/                 #   form beli langsung di detail
    │   └── form-submission/               # → /form-submission, /form-submission/:id/edit (SubmissionModule)
    ├── module/{pokemon,submission}/       # feature NgModule (lazy-loaded)
    ├── route/                             # routing module milik feature module
    ├── guards/                            # authGuard & guestGuard (functional, cek Firebase Auth), FormGuard (canDeactivate)
    ├── interceptors/                      # firebaseAuthInterceptor: tempel ?auth=<idToken> ke request Realtime DB
    ├── services/                          # PokemonService (HttpClient + cache), AuthService, RealtimeDatabaseService, CartActionsService, BinderStateService
    ├── shared/                            # product.ts (Product, harga & rarity), rupiah.pipe.ts (standalone)
    └── state/cart/                        # action, reducer, selector, state
```

### Alur routing

```
/auth                         AuthComponent
/  (authGuard, HomeLayoutComponent)    '' → redirect ke pokemon
├── cart                      CartComponent
├── checkout                  CheckoutComponent
├── pokemon        (lazy)     PokemonListComponent
│   └── detail/:name          PokemonDetailComponent   [FormGuard]
└── form-submission (lazy)    FormSubmissionComponent
    └── :id/edit              FormSubmissionEditComponent [FormGuard]
```

`/auth` dijaga `guestGuard` (user yang sudah login diarahkan ke `/pokemon`). URL tak dikenal (`**`) diarahkan ke `/pokemon`.

### Alur data

- **Session**: sumber kebenaran adalah Firebase Auth (`AuthService.user$`, `currentUser()`). Jangan menyimpan user ke sessionStorage.
- **Guard di server**: `authGuard` mengembalikan `false` saat SSR/prerender (tidak ada sesi), sehingga halaman terlindungi di-render kosong lalu dicek ulang di browser.
- **Akses data**: request ke Realtime DB otomatis membawa token lewat interceptor; aturan akses ada di `database.rules.json` (harus di-publish manual di Firebase Console > Realtime Database > Rules).
- **Pesanan per user**: checkout menyimpan `userId`; Orders memakai query `orderBy="userId"&equalTo="<uid>"`. Pesanan lama tanpa `userId` tidak bisa diakses lagi setelah rules di-publish.
- **Cart**: state disimpan ke `sessionStorage['cart']` oleh meta-reducer `persist` (`cart.reducer.ts`) setelah setiap action, hanya `state.cart` dan hanya kalau berubah. Pemulihan saat start lewat `loadInitialState()`. Meta-reducer `logger` hanya aktif di development (`isDevMode()`), tetapi kodenya tetap ikut bundle production.
- **Order**: `CheckoutComponent` dan `PokemonFormsComponent` sama-sama `POST` ke `formSubmissions` di Realtime DB, dengan bentuk data berbeda.

## Arah desain: binder kartu TCG

- Token di `tailwind.config.js`: `binder` `#1d2f5c`, `sleeve` `#e6ecf5`, `gold` `#f4c73b`, `ink` `#20243a`, `pokered` `#e3350d`, `paper`.
- `pokered` hanya untuk aksi beli/keranjang. Jangan dipakai untuk dekorasi atau navigasi.
- Font: `font-display` (Archivo; `.font-wide` = versi Expanded untuk judul/nama kartu), `font-body` (Atkinson Hyperlegible).
- Warna tipe: class global `type-<nama>` mengisi `--type-color`; pakai `var(--type-color)` di CSS. Jangan membuat class Tailwind dinamis (`'bg-' + type`).
- `<app-tcg-card>` memakai satuan `cqw`; ukuran kartu ditentukan oleh lebar parent. Konten tambahan (mis. harga) lewat `<ng-content>`.
- Hindari: label huruf kapital semua, monospace untuk angka kecil, efek hover/animasi di setiap elemen, kotak putih untuk setiap section.

## E-commerce

- Harga & rarity dihitung di `shared/product.ts` dari total base stats (`priceFor`, `rarityFor`). Jangan hitung harga di komponen.
- Selalu ubah respons PokeAPI dengan `productFromApi()` sebelum masuk ke cart atau `<app-tcg-card>`.
- Cart menyimpan `Product` (bukan respons API mentah) di `sessionStorage['cart']`; item tanpa `price` dibuang saat load.
- Pesanan disimpan ke `formSubmissions` dengan `pokemonToBuy: [{ pokemon: [name], quantity, unitPrice }]`, `total`, `createdAt`.
- `TcgCardComponent` dan `RupiahPipe` standalone: import ke NgModule, jangan dideklarasikan.

## Config environment (jangan di-commit)

- `src/environment.template.ts` adalah template (placeholder `__FIREBASE_...__`) dan di-commit. `src/environment.ts` dan `.env` ada di `.gitignore`.
- `scripts/generate-environment.mjs` membuat `src/environment.ts` dari template. Sumber nilai: variabel lingkungan (Railway), lalu `.env` (lokal). Dijalankan otomatis oleh hook npm `predev`, `prebuild`, `prewatch`, `pretest`; manual: `npm run env:generate`.
- Variabel wajib belum lengkap dan `src/environment.ts` sudah ada → skrip memakai file itu (nyaman untuk lokal). File belum ada → gagal dengan daftar variabel. Nilai dengan tanda kutip/spasi/backslash ditolak.
- Setup clone baru: salin `.env.example` menjadi `.env`, isi nilainya, jalankan `npm run dev`.
- Memanggil `ng build`/`ng serve` langsung (tanpa npm) melewati hook, jadi jalankan `npm run env:generate` dulu.
- Jangan men-stage atau commit `src/environment.ts`/`.env`, jangan memakai `git add -f` untuk keduanya, dan jangan menaruh nilai asli di template.

## Deployment (Railway)

- Railway (Railpack) menjalankan `npm run build`, lalu `npm start`. Tidak ada file konfigurasi Railway di repo (`railway.json` sudah deprecated untuk service baru).
- Versi Node dipin di `.nvmrc` (22). Angular CLI 19.0.4 mendukung Node ≥ 22. Railpack hanya mendukung versi LTS yang masih aktif.
- Server (`src/server.ts`) membaca `process.env['PORT']`.
- Isi **Variables** di Railway dengan 7 variabel `FIREBASE_*` yang wajib (nama dan contoh ada di `.env.example`; `FIREBASE_MEASUREMENT_ID` opsional) SEBELUM build pertama. Tanpa itu build sengaja gagal dengan daftar variabel yang kurang, supaya tidak ada deploy dengan config kosong.
- Cache: file ber-hash (JS/CSS) `max-age=1y`; semua HTML (prerender maupun SSR) `no-cache` supaya deploy baru langsung terlihat. Jangan mengubah `index.html` menjadi di-cache lama.
- Setelah dapat domain Railway: tambahkan ke Firebase Console > Authentication > Settings > Authorized domains.
- Uji lokal seperti Railway: `npm run build`, lalu `PORT=4100 npm start`.

## Performa

- `PokemonService` menyimpan Promise per URL (request yang sama dipakai bersama) dan membuang field besar yang tidak dipakai (`moves`, `game_indices`, dll.). Kalau suatu saat butuh `moves`, ubah `slimPokemon()`.
- Firebase Auth memakai `initializeAuth` (tanpa popup/redirect resolver). Kalau menambah login Google, ganti ke `getAuth` atau tambahkan `popupRedirectResolver`.
- Budget bundle initial: peringatan di 650 kB (ukuran saat ini ±590 kB). Kalau terlewati, cari penyebabnya dulu sebelum menaikkan angka.

## Konvensi yang berlaku saat ini

- Komponen baru: `standalone: false` (diset di schematics `angular.json`), deklarasikan di module yang sesuai.
- Async memakai `async/await` + Promise; observable dikonversi dengan `firstValueFrom`.
- Validasi form: Reactive Forms, `markAllAsTouched()` saat invalid.
- Kode yang menyentuh `window`/`sessionStorage` wajib aman untuk SSR (cek `typeof sessionStorage !== 'undefined'`).
- Komentar dan teks UI campuran Bahasa Indonesia/Inggris.

## Hal yang perlu diwaspadai

- `app.module.ts` masih meng-import `CvModule`, padahal folder `src/app/cv/` sudah dihapus di working tree → **build gagal** sampai import itu dibersihkan.
- Config Firebase tidak boleh masuk git (lihat bagian Config environment). Ingat: nilainya tetap terkirim ke browser di dalam bundle JS, jadi yang benar-benar melindungi data adalah Firebase Security Rules dan pembatasan API key di Google Cloud Console. Config project lama sudah terlanjur ada di riwayat git publik.
- Beberapa komponen pakai `export default` (`FormSubmission*`, `PokemonForms`), sisanya named export.
- Nama file `pokemon-list-component.ts` (tanda hubung, bukan titik) tidak mengikuti pola Angular.
- Banyak tipe `any` untuk data Pokémon; belum ada interface model.
- Spec file kebanyakan hasil generate CLI dan kemungkinan tidak lulus (komponen butuh Store/Firebase/Router).

## Saat mengubah kode

1. Jangan menambah pola baru setengah jalan (mis. satu komponen standalone di tengah NgModule) tanpa rencana migrasi.
2. Pastikan `npm run build` lulus — build production juga menjalankan prerender, jadi error SSR ikut ketahuan.
3. Data PokeAPI lewat `PokemonService`; data Firebase lewat `RealtimeDatabaseService`. Jangan panggil HTTP langsung dari komponen.
