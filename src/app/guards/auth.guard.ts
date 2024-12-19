import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if(typeof sessionStorage === 'undefined' || !sessionStorage.getItem('user')) {
      this.router.navigate(['/auth']);
      return false;
    }
    return true;
  }
}
