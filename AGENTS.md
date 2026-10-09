# AGENTS.md — Mini App Pokemon

Panduan untuk AI agent (dan developer) yang bekerja di repo ini. Baca ini sebelum mengubah kode.

## Ringkasan

Aplikasi Angular 19 untuk menjelajah Pokémon (data dari [PokeAPI](https://pokeapi.co)), menambahkannya ke keranjang, lalu checkout. Pesanan disimpan di Firebase Realtime Database; login/register memakai Firebase Auth. Project ini berasal dari materi training (nama internal masih `training-day-1`).

## Stack

| Area | Teknologi |
|---|---|
| Framework | Angular 19, **NgModule-based** (`standalone: false` di semua komponen) |
| Rendering | SSR + prerender (`@angular/ssr`, Express di `src/server.ts`) |
| State | NgRx Store (hanya feature `cart`), Effects & Devtools terpasang tapi belum dipakai |
| Auth | `@angular/fire/auth` (email + password) |
| Database | Firebase Realtime Database via REST (`HttpClient`) |
| HTTP ke PokeAPI | `axios` (bukan `HttpClient`) |
| Styling | Tailwind CSS 3 + CSS per komponen, Font Awesome via CDN, Google Fonts (Archivo, Atkinson Hyperlegible) |
| Test | Karma + Jasmine |

## Perintah

```bash
npm start                         # ng serve → http://localhost:4200
npm run build                     # build production (SSR + prerender) ke dist/training-day-1
npm test                          # Karma
npm run serve:ssr:training-day-1  # jalankan hasil build SSR → http://localhost:4000
```

Belum ada lint/format script (tidak ada ESLint/Prettier di `package.json`).

## Struktur

```
src/
├── main.ts / main.server.ts / server.ts   # entry browser, SSR, Express
├── environment.ts                         # config Firebase (default export, satu file untuk semua env)
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
    ├── guards/                            # AuthGuard (cek sessionStorage 'user'), FormGuard (canDeactivate)
    ├── services/                          # PokemonService (axios), AuthService, RealtimeDatabaseService
    ├── shared/                            # product.ts (Product, harga & rarity), rupiah.pipe.ts (standalone)
    ├── state/cart/                        # action, reducer, selector, state (+ CartStateModule yang tidak dipakai)
    └── pipe/titlecase.pipe.ts             # bentrok nama dengan TitleCasePipe bawaan Angular
```

### Alur routing

```
/auth                         AuthComponent
/  (AuthGuard, HomeLayoutComponent)
├── cart                      CartComponent
├── checkout                  CheckoutComponent
├── pokemon        (lazy)     PokemonListComponent
│   └── detail/:name          PokemonDetailComponent   [FormGuard]
└── form-submission (lazy)    FormSubmissionComponent
    └── :id/edit              FormSubmissionEditComponent [FormGuard]
```

Tidak ada route `''` → redirect dan tidak ada wildcard `**`; membuka `/` hanya menampilkan sidebar kosong.

### Alur data

- **Session**: `AuthService` menyimpan `{email, uid}` ke `sessionStorage['user']`. `AuthGuard` hanya mengecek key itu ada — bukan status Firebase Auth.
- **Cart**: reducer membaca/menulis `sessionStorage['cart']` langsung di dalam reducer (side effect).
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

## Konvensi yang berlaku saat ini

- Komponen baru: `standalone: false` (diset di schematics `angular.json`), deklarasikan di module yang sesuai.
- Async memakai `async/await` + Promise; observable dikonversi dengan `firstValueFrom`.
- Validasi form: Reactive Forms, `markAllAsTouched()` saat invalid.
- Kode yang menyentuh `window`/`sessionStorage` wajib aman untuk SSR (cek `typeof sessionStorage !== 'undefined'`).
- Komentar dan teks UI campuran Bahasa Indonesia/Inggris.

## Hal yang perlu diwaspadai

- `app.module.ts` masih meng-import `CvModule`, padahal folder `src/app/cv/` sudah dihapus di working tree → **build gagal** sampai import itu dibersihkan.
- `src/environment.ts` berisi config Firebase dan ter-commit. API key web Firebase memang bukan rahasia, tapi keamanan bergantung penuh pada Firebase Security Rules.
- Beberapa komponen pakai `export default` (`FormSubmission*`, `PokemonForms`), sisanya named export.
- Nama file `pokemon-list-component.ts` (tanda hubung, bukan titik) tidak mengikuti pola Angular.
- Banyak tipe `any` untuk data Pokémon; belum ada interface model.
- Spec file kebanyakan hasil generate CLI dan kemungkinan tidak lulus (komponen butuh Store/Firebase/Router).

## Saat mengubah kode

1. Jangan menambah pola baru setengah jalan (mis. satu komponen standalone di tengah NgModule) tanpa rencana migrasi.
2. Pastikan `npm run build` lulus — build production juga menjalankan prerender, jadi error SSR ikut ketahuan.
3. Data PokeAPI lewat `PokemonService`; data Firebase lewat `RealtimeDatabaseService`. Jangan panggil HTTP langsung dari komponen.
