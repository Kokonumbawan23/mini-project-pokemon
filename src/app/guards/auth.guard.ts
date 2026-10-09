import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Hanya user yang sudah login yang boleh masuk.
 * Functional guard: cukup sebuah fungsi, dependency diambil dengan inject().
 * Penting: semua inject() dipanggil SEBELUM await, karena setelah await
 * konteks injeksi Angular sudah tidak tersedia.
 */
export const authGuard: CanActivateFn = async () => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const router = inject(Router);
  const authService = inject(AuthService);

  // Di server (SSR/prerender) tidak ada sesi login. Jangan redirect ke /auth,
  // cukup render kosong; browser akan mengecek ulang setelah aplikasi berjalan.
  if (!isBrowser) return false;

  const user = await authService.currentUser();
  return user ? true : router.createUrlTree(['/auth']);
};

/** Kebalikannya: user yang sudah login tidak perlu melihat halaman login lagi */
export const guestGuard: CanActivateFn = async () => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!isBrowser) return true;

  const user = await authService.currentUser();
  return user ? router.createUrlTree(['/pokemon']) : true;
};
