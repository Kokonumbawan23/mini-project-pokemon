import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom } from 'rxjs';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { CartItem } from '../../state/cart/cart.state';
import { clearCart } from '../../state/cart/cart.action';
import { selectCartItem, selectCartSubtotal, selectCartTotalQuantity } from '../../state/cart/cart.selector';

@Component({
  selector: 'app-checkout',
  standalone: false,

  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  cartItems$: Observable<CartItem[]>;
  totalQuantity$: Observable<number>;
  subtotal$: Observable<number>;

  isSubmitting = false;
  submitError = '';
  /** Ringkasan pesanan yang berhasil, ditampilkan di halaman konfirmasi */
  placedOrder: { name: string; email: string; total: number; cards: number } | null = null;

  checkoutForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phoneCountryCode: new FormControl('+62', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]{9,13}$/)] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
  });

  constructor(private dbService: RealtimeDatabaseService, private store: Store) {
    this.cartItems$ = this.store.select(selectCartItem);
    this.totalQuantity$ = this.store.select(selectCartTotalQuantity);
    this.subtotal$ = this.store.select(selectCartSubtotal);
  }

  /** true kalau field sudah disentuh dan tidak valid, untuk menampilkan pesan error */
  showError(field: 'firstName' | 'lastName' | 'email' | 'phone' | 'address'): boolean {
    const control = this.checkoutForm.controls[field];
    return control.invalid && control.touched;
  }

  async submitOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // Ambil isi cart saat ini satu kali (tanpa subscribe terus-menerus)
    const items = await firstValueFrom(this.cartItems$);
    if (items.length === 0) return;

    const total = items.reduce((sum, item) => sum + item.pokemon.price * item.quantity, 0);
    const cards = items.reduce((sum, item) => sum + item.quantity, 0);
    const form = this.checkoutForm.getRawValue();

    const orderData = {
      ...form,
      // Bentuk pokemonToBuy dipertahankan agar halaman Orders tetap bisa membacanya
      pokemonToBuy: items.map(item => ({
        pokemon: [item.pokemon.name],
        quantity: item.quantity,
        unitPrice: item.pokemon.price,
      })),
      total,
      createdAt: new Date().toISOString(),
    };

    this.isSubmitting = true;
    this.submitError = '';
    try {
      await this.dbService.saveFormSubmission(orderData);
      this.placedOrder = { name: form.firstName, email: form.email, total, cards };
      this.store.dispatch(clearCart());
      this.checkoutForm.reset();
    } catch {
      this.submitError = 'Your order could not be sent. Check your connection and try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
