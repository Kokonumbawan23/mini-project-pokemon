import { clearCart } from './../../state/cart/cart.action';
import { Component } from '@angular/core';
import { CartItem, CartState } from '../../state/cart/cart.state';
import { select, Store } from '@ngrx/store';
import { selectCartItem, selectCartItemCount, selectCartState } from '../../state/cart/cart.selector';
import { removeCart } from '../../state/cart/cart.action';

@Component({
  selector: 'app-cart',
  standalone: false,

  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  cartItem$;
  totalItem$;
  constructor(private store:Store) {
    this.cartItem$ = this.store.pipe(select(selectCartItem));
    this.totalItem$ = this.store.pipe(select(selectCartItemCount));
  }

  removeItem(pokemonName: string){
    this.store.dispatch(removeCart({pokemonName}));
  }

  clearCart(){
    this.store.dispatch(clearCart());
  }
}
