import { isDevMode } from '@angular/core';
import { createReducer, on, ActionReducer, MetaReducer } from '@ngrx/store';
import { CartState, initialCartState } from './cart.state';
import { addCart, removeCart, updateQuantity, clearCart } from './cart.action';

export const loadInitialState = (): CartState => {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = JSON.parse(sessionStorage.getItem('cart') ?? 'null');
      // Buang item dengan bentuk data lama (sebelum ada harga), supaya halaman tidak error
      const items = Array.isArray(stored?.items)
        ? stored.items.filter(
            (item: any) => typeof item?.pokemon?.price === 'number',
          )
        : [];
      return { items };
    } catch {
      return initialCartState;
    }
  }

  return initialCartState;
};

export const saveStateToSessionStorage = (state: CartState) => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('cart', JSON.stringify(state));
  }
  return state;
};

export const logger = (reducer: ActionReducer<any>): ActionReducer<any> => {
  return (state, action) => {
    const next = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('prev state', state);
    console.log('action', action);
    console.log('next state', next);
    console.groupEnd();
    return next;
  };
};

export const persist = (reducer: ActionReducer<any>): ActionReducer<any> => {
  return (state, action) => {
    const next = reducer(state, action);
    if (next !== state) {
      saveStateToSessionStorage(next.cart);
    }
    return next;
  };
};

export const cartReducer = createReducer(
  loadInitialState(),
  on(addCart, (state, { pokemon, quantity }) => {
    const existingItemIndex = state.items.findIndex(
      (item) => item.pokemon.name === pokemon.name,
    );

    let newState: CartState;

    if (existingItemIndex > -1) {
      const updatedItems = state.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );

      newState = { ...state, items: updatedItems };
    } else {
      newState = {
        ...state,
        items: [...state.items, { pokemon, quantity }],
      };
    }

    return newState;
  }),
  on(removeCart, (state, { pokemonName }) => {
    const updatedItems = state.items.filter(
      (item) => item.pokemon.name !== pokemonName,
    );

    const newState = { ...state, items: updatedItems };

    return newState;
  }),
  on(updateQuantity, (state, { pokemonName, quantity }) => {
    // quantity <= 0 dianggap menghapus item dari cart
    const updatedItems =
      quantity > 0
        ? state.items.map((item) =>
            item.pokemon.name === pokemonName ? { ...item, quantity } : item,
          )
        : state.items.filter((item) => item.pokemon.name !== pokemonName);

    const newState = { ...state, items: updatedItems };

    return newState;
  }),
  on(clearCart, (state) => {
    saveStateToSessionStorage(initialCartState);
    return initialCartState;
  }),
);

// logger hanya untuk development: di production ia membocorkan isi state ke console
export const metaReducers: MetaReducer<any>[] = isDevMode()
  ? [persist, logger]
  : [persist];
