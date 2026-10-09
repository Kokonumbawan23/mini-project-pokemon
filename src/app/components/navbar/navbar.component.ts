import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectCartTotalQuantity } from '../../state/cart/cart.selector';
import { clearCart } from '../../state/cart/cart.action';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  cartItemCount$: Observable<number>;
  userEmail$: Observable<string | null>;

  constructor(private router: Router, private store: Store, private authService: AuthService) {
    this.cartItemCount$ = this.store.select(selectCartTotalQuantity);
    this.userEmail$ = this.authService.user$.pipe(map(user => user?.email ?? null));
  }

  async logout(){
    await this.authService.logout();
    // Cart milik user sebelumnya tidak boleh terbawa ke user berikutnya
    this.store.dispatch(clearCart());
    this.router.navigate(['/auth']);
  }

}
