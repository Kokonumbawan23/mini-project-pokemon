import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Product, priceFor, rarityFor } from '../../shared/product';

type Mode = 'login' | 'register';

/** Pesan untuk kode error Firebase Auth yang paling sering muncul */
const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'That email and password don\'t match. Check them and try again.',
  'auth/user-not-found': 'That email and password don\'t match. Check them and try again.',
  'auth/wrong-password': 'That email and password don\'t match. Check them and try again.',
  'auth/email-already-in-use': 'An account with this email already exists. Log in instead.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/invalid-email': 'Enter an email address like name@example.com.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/network-request-failed': 'You appear to be offline. Check your connection and try again.',
};

/** Tiga starter untuk ilustrasi sampul binder */
function starter(id: number, name: string, type: string, hp: number, total: number): Product {
  return {
    id, name, hp, total,
    types: [type],
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    rarity: rarityFor(total),
    price: priceFor(total),
  };
}

@Component({
  selector: 'app-auth',
  standalone: false,

  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  mode: Mode = 'login';
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  readonly starters: Product[] = [
    starter(1, 'bulbasaur', 'grass', 45, 318),
    starter(4, 'charmander', 'fire', 39, 309),
    starter(7, 'squirtle', 'water', 44, 314),
  ];

  formGroup = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  constructor(private authService: AuthService, private router: Router) { }

  setMode(mode: Mode) {
    this.mode = mode;
    this.errorMessage = '';
  }

  showError(field: 'email' | 'password'): boolean {
    const control = this.formGroup.controls[field];
    return control.invalid && control.touched;
  }

  async onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { email, password } = this.formGroup.getRawValue();
    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      if (this.mode === 'login') {
        await this.authService.login(email, password);
      } else {
        await this.authService.register(email, password);
      }
      this.router.navigate(['/pokemon']);
    } catch (error: any) {
      const code: string = error?.code ?? 'unknown';
      this.errorMessage = AUTH_ERRORS[code] ?? `${this.mode === 'login' ? 'Login' : 'Sign-up'} failed (${code}). Try again in a moment.`;
    } finally {
      this.isSubmitting = false;
    }
  }
}
