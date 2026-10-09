import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CartItem } from '../../state/cart/cart.state';
import {
  clearCart,
  removeCart,
  updateQuantity,
} from '../../state/cart/cart.action';
import {
  selectCartItem,
  selectCartSubtotal,
  selectCartTotalQuantity,
  selectMostExpensiveItem,
} from '../../state/cart/cart.selector';
import { RARITY_LABEL } from '../../shared/product';

@Component({
  selector: 'app-cart',
  standalone: false,

  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  readonly maxQuantity = 99;
  readonly rarityLabel = RARITY_LABEL;

  cartItems$: Observable<CartItem[]>;
  totalQuantity$: Observable<number>;
  subtotal$: Observable<number>;
  expensiveItem$: Observable<string>;
  constructor(private store: Store) {
    this.cartItems$ = this.store.select(selectCartItem);
    this.totalQuantity$ = this.store.select(selectCartTotalQuantity);
    this.subtotal$ = this.store.select(selectCartSubtotal);
    this.expensiveItem$ = this.store.select(selectMostExpensiveItem);
  }

  changeQuantity(item: CartItem, delta: number) {
    const quantity = Math.min(this.maxQuantity, item.quantity + delta);
    // quantity 0 akan menghapus item (diatur di reducer)
    this.store.dispatch(
      updateQuantity({ pokemonName: item.pokemon.name, quantity }),
    );
  }

  removeItem(pokemonName: string) {
    this.store.dispatch(removeCart({ pokemonName }));
  }

  clearCart() {
    if (confirm('Remove all cards from your cart?')) {
      this.store.dispatch(clearCart());
    }
  }

  trackByName(_: number, item: CartItem) {
    return item.pokemon.name;
  }
}
