import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isloggedin = false;

  constructor() { }

  login() {
    this.isloggedin = true;
  }

  logout() {
    this.isloggedin = false;
  }

  showStatus() {
    return this.isloggedin;
  }
}
