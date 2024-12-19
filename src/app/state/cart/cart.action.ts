import { createAction, props } from "@ngrx/store";

export const addCart = createAction("[Cart] Add Cart", props<{ pokemon: any, quantity: number }>());

export const removeCart = createAction("[Cart] Remove Cart", props<{ pokemonName: string }>());

export const updateQuantity = createAction("[Cart] Update Quantity", props<{ pokemonName: string, quantity: number }>());

export const clearCart = createAction("[Cart] Clear Cart");


