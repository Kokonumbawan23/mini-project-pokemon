import { NgModule } from "@angular/core";
import { cartReducer } from "./cart.reducer";
import { StoreModule } from "@ngrx/store";

@NgModule({
  imports: [StoreModule.forFeature('cart', cartReducer)]
})
export class CartStateModule { }
