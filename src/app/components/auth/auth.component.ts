import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: false,

  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  formStatus: string = 'login';
  formGroup: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private authService: AuthService, private router: Router) { }

  setFormStatus(event: Event) {
    this.formStatus = (event.target as HTMLButtonElement).value as 'login' | 'register';
  }

  async onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.formStatus === 'login') {
      await this.login();
      console.log('Login Successful');
      this.router.navigate(['/pokemon']);
    } else {
      await this.register();
      this.router.navigate(['/pokemon']);
    }
  }

  async login(){
    await this.authService.login(this.formGroup.controls['email'].value, this.formGroup.controls['password'].value);
  }

  async register(){
    await this.authService.register(this.formGroup.controls['email'].value, this.formGroup.controls['password'].value);
  }

}
