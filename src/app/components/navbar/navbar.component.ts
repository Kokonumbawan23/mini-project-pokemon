import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCartTotalQuantity } from '../../state/cart/cart.selector';

@Component({
  selector: 'app-navbar',
  standalone: false,

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  cartItemCount$: Observable<number>;

  constructor(private router: Router, private store: Store) {
    this.cartItemCount$ = this.store.select(selectCartTotalQuantity);

   }


  logout(){
    sessionStorage.clear();
    this.router.navigate(['/auth']);
  }

}
