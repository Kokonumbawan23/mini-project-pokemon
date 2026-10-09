import { Injectable, NgZone } from '@angular/core';
import { inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { RealtimeDatabaseService } from './realtime-database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);

  constructor(
    private realtimeDatabaseService: RealtimeDatabaseService,
    private ngZone: NgZone
  ) {}

  private isSessionStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && !!window.sessionStorage;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.ngZone.runOutsideAngular(() =>
        signInWithEmailAndPassword(this.auth, email, password)
      );

      const userData = {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      };

      if (this.isSessionStorageAvailable()) {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

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

      const userData = {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        registeredAt: new Date().toISOString(),
      };

      await this.realtimeDatabaseService.saveUser(
        userCredential.user.uid,
        userData
      );

      if (this.isSessionStorageAvailable()) {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

    } catch (error: any) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  logout(): void {
    if (this.isSessionStorageAvailable()) {
      sessionStorage.removeItem('user');
    }
  }

  getUser(): any {
    if (!this.isSessionStorageAvailable()) {
      return null;
    }
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
