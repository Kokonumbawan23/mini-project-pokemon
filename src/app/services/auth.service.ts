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

      this.ngZone.run(() => {
        alert('Login Successful');
      });
    } catch (error: any) {
      console.error('Login Error:', error);
      this.ngZone.run(() => {
        alert('Login Failed: ' + error.message);
      });
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

      this.ngZone.run(() => {
        alert('Registration Successful');
      });
    } catch (error: any) {
      console.error('Registration Error:', error);
      this.ngZone.run(() => {
        alert('Registration Failed: ' + error.message);
      });
      throw error;
    }
  }

  logout(): void {
    if (this.isSessionStorageAvailable()) {
      sessionStorage.removeItem('user');
    }
    this.ngZone.run(() => {
      alert('Logged out successfully');
    });
  }

  getUser(): any {
    if (!this.isSessionStorageAvailable()) {
      return null;
    }
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
