import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.state';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItem = createSelector(
  selectCartState,
  (state: CartState) => state.items,
);

/** Jumlah jenis kartu yang berbeda */
export const selectCartItemCount = createSelector(
  selectCartItem,
  (items) => items.length,
);

/** Jumlah semua kartu, termasuk quantity (2 Pikachu + 1 Eevee = 3) */
export const selectCartTotalQuantity = createSelector(selectCartItem, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export const selectCartSubtotal = createSelector(selectCartItem, (items) =>
  items.reduce((sum, item) => sum + item.pokemon.price * item.quantity, 0),
);

export const selectMostExpensiveItem = createSelector(
  selectCartItem,
  (items) => {
    const expensiveItem = items.reduce((maxItem, item) =>
      item.pokemon.price > maxItem.pokemon.price ? item : maxItem,
    );
    return expensiveItem.pokemon.name;
  },
);

/** Berapa banyak kartu dengan nama tertentu yang sudah ada di cart */
export const selectQuantityInCart = (name: string) =>
  createSelector(
    selectCartItem,
    (items) => items.find((item) => item.pokemon.name === name)?.quantity ?? 0,
  );
