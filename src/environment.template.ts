// TEMPLATE config environment. File ini BOLEH di-commit karena hanya berisi placeholder.
//
// Jangan isi nilai asli di sini. `npm run build`, `npm run dev`, `npm run watch` dan `npm test`
// membuat src/environment.ts (file itu TIDAK di-commit) dari template ini, dengan mengganti
// setiap placeholder (dua garis bawah + nama variabel + dua garis bawah) memakai variabel lingkungan atau file .env. Lihat scripts/generate-environment.mjs.
const environment = {
  production: false,
  firebase: {
    apiKey: '__FIREBASE_API_KEY__',
    authDomain: '__FIREBASE_AUTH_DOMAIN__',
    databaseURL: '__FIREBASE_DATABASE_URL__',
    projectId: '__FIREBASE_PROJECT_ID__',
    storageBucket: '__FIREBASE_STORAGE_BUCKET__',
    messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
    appId: '__FIREBASE_APP_ID__',
    measurementId: '__FIREBASE_MEASUREMENT_ID__',
  },
};

export default environment;
