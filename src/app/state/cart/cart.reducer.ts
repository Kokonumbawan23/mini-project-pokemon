import { createReducer, on } from '@ngrx/store';
import { CartState, initialCartState } from './cart.state';
import { addCart, removeCart, updateQuantity, clearCart } from './cart.action';

export const loadInitialState = (): CartState => {
  if (typeof sessionStorage !== 'undefined') {
    const storedState = sessionStorage.getItem('cart');
    return storedState ? JSON.parse(storedState) : initialCartState;
  }

  return initialCartState;
};

export const saveStateToSessionStorage = (state: CartState) => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('cart', JSON.stringify(state));
  }
  return state;
};

export const cartReducer  = createReducer(
  loadInitialState(),
  on(addCart, (state, { pokemon, quantity }) => {
    const existingItemIndex = state.items.findIndex(
      (item) => item.pokemon.name === pokemon.name
    );

    let newState: CartState;

    if (existingItemIndex > -1) {
      const updatedItems = state.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );

      newState = { ...state, items: updatedItems };
    } else {
      newState = {
        ...state,
        items: [...state.items, { pokemon, quantity }],
      };
    }

    saveStateToSessionStorage(newState);
    return newState;
  }),
  on(removeCart, (state, { pokemonName }) => {
    const updatedItems = state.items.filter(
      (item) => item.pokemon.name !== pokemonName
    );

    const newState = { ...state, items: updatedItems };

    saveStateToSessionStorage(newState);
    return newState;
  }),
  on(clearCart, (state) => {
    saveStateToSessionStorage(initialCartState);
    return initialCartState;
  }),
)
