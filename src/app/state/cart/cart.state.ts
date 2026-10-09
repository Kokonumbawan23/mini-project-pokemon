import { Product } from '../../shared/product';

export interface CartItem {
  pokemon: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export const initialCartState: CartState = {
  items: []
}
