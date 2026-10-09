import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';
import environment from '../../environment';

/**
 * Menempelkan ID token Firebase (?auth=...) ke setiap request ke Realtime Database.
 * Dengan token ini, Security Rules tahu siapa yang meminta data (auth.uid).
 * Request ke URL lain (mis. PokeAPI) diteruskan apa adanya.
 */
export const firebaseAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.firebase.databaseURL)) {
    return next(req);
  }

  const auth = inject(Auth);

  // Tunggu Firebase selesai memulihkan sesi, lalu ambil token (diperbarui otomatis kalau kedaluwarsa)
  return from(
    auth.authStateReady().then(() => auth.currentUser?.getIdToken() ?? null)
  ).pipe(
    switchMap(token => next(token ? req.clone({ setParams: { auth: token } }) : req))
  );
};
