import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCartItemCount } from '../../state/cart/cart.selector';

@Component({
  selector: 'app-sidebar',
  standalone: false,

  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  cartItemCount$: Observable<number>;

  constructor(private router: Router, private store: Store) {
    this.cartItemCount$ = this.store.select(selectCartItemCount);

   }


  logout(){
    sessionStorage.clear();
    this.router.navigate(['/auth']);
  }

}
