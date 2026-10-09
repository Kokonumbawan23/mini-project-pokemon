/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      // Token desain "binder kartu TCG". Pakai: bg-binder, text-ink, border-gold, dst.
      colors: {
        binder: '#1d2f5c',  // sampul & halaman binder
        sleeve: '#e6ecf5',  // latar halaman, kantong plastik
        gold:   '#f4c73b',  // bingkai kartu TCG
        ink:    '#20243a',  // teks
        pokered:'#e3350d',  // HANYA untuk aksi beli / keranjang
        paper:  '#ffffff',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
