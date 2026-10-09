import { Injectable, NgZone, inject } from '@angular/core';
import {
  Auth,
  User,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { RealtimeDatabaseService } from './realtime-database.service';

/**
 * Sumber kebenaran status login adalah Firebase Auth (bukan sessionStorage).
 * Firebase menyimpan sesi sendiri, jadi user tetap login setelah refresh.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);

  /** Emit user yang sedang login, atau null. Ikut berubah saat login/logout. */
  readonly user$: Observable<User | null> = authState(this.auth);

  constructor(
    private realtimeDatabaseService: RealtimeDatabaseService,
    private ngZone: NgZone
  ) {}

  /** User saat ini, setelah Firebase selesai memulihkan sesi dari penyimpanan browser */
  async currentUser(): Promise<User | null> {
    await this.auth.authStateReady();
    return this.auth.currentUser;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await this.ngZone.runOutsideAngular(() =>
        signInWithEmailAndPassword(this.auth, email, password)
      );
    } catch (error: any) {
      // Service tidak menampilkan UI; komponen yang memutuskan pesan untuk user
      console.error('Login Error:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.ngZone.runOutsideAngular(() =>
        createUserWithEmailAndPassword(this.auth, email, password)
      );

      await this.realtimeDatabaseService.saveUser(userCredential.user.uid, {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        registeredAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
