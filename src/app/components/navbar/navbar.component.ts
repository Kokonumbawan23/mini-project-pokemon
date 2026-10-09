import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, pairwise } from 'rxjs';
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
  /** true sesaat setelah jumlah kartu bertambah, untuk animasi badge */
  bump = false;
  private bumpTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router, private store: Store, private authService: AuthService) {
    this.cartItemCount$ = this.store.select(selectCartTotalQuantity);
    this.userEmail$ = this.authService.user$.pipe(map(user => user?.email ?? null));

    // pairwise: bandingkan nilai sebelumnya dan sekarang; animasikan hanya kalau bertambah
    this.cartItemCount$
      .pipe(pairwise(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(([prev, curr]) => {
        if (curr > prev) {
          this.bump = false;
          clearTimeout(this.bumpTimer);
          // Tunggu satu frame supaya class bisa dilepas lalu dipasang lagi (animasi berulang)
          requestAnimationFrame(() => {
            this.bump = true;
            this.bumpTimer = setTimeout(() => this.bump = false, 450);
          });
        }
      });
  }

  async logout(){
    await this.authService.logout();
    // Cart milik user sebelumnya tidak boleh terbawa ke user berikutnya
    this.store.dispatch(clearCart());
    this.router.navigate(['/auth']);
  }

}
