import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { Product } from '../shared/product';
import { ToastService } from '../shared/toast/toast.service';
import { addCart, updateQuantity } from '../state/cart/cart.action';
import { selectCartItem } from '../state/cart/cart.selector';

/** Elemen tujuan animasi "terbang ke cart" (dipasang di link Cart pada navbar) */
const CART_TARGET_SELECTOR = '[data-cart-target]';

/**
 * Semua aksi "tambah ke cart" lewat sini, supaya perilakunya sama di setiap halaman:
 * animasi terbang ke cart, toast konfirmasi, dan tombol Undo.
 */
@Injectable({ providedIn: 'root' })
export class CartActionsService {
  private store = inject(Store);
  private toast = inject(ToastService);

  /**
   * @param from elemen asal animasi (biasanya kartu yang diklik)
   */
  add(products: Product[], from?: HTMLElement | null) {
    if (!products.length) return;

    // Catat quantity sebelum ditambah, untuk Undo
    const before = this.quantitiesInCart(products);

    for (const product of products) {
      this.store.dispatch(addCart({ pokemon: product, quantity: 1 }));
    }

    if (from) {
      this.flyToCart(from, products[0].image);
    }

    const name = (p: Product) => p.name.charAt(0).toUpperCase() + p.name.slice(1);
    const message = products.length === 1
      ? `Added ${name(products[0])} to your cart`
      : `Added ${products.length} cards to your cart`;

    this.toast.show(message, {
      actionLabel: 'Undo',
      action: () => {
        // Kembalikan quantity ke nilai sebelumnya (0 = item dihapus, diatur di reducer)
        for (const product of products) {
          this.store.dispatch(updateQuantity({ pokemonName: product.name, quantity: before[product.name] }));
        }
      },
    });
  }

  private quantitiesInCart(products: Product[]): Record<string, number> {
    const result: Record<string, number> = {};
    // Store NgRx mengirim nilai saat ini secara sinkron saat di-subscribe
    this.store.select(selectCartItem).pipe(take(1)).subscribe(items => {
      for (const product of products) {
        result[product.name] = items.find(i => i.pokemon.name === product.name)?.quantity ?? 0;
      }
    });
    return result;
  }

  /** Gambar kartu "terbang" dari elemen asal ke ikon Cart di navbar (Web Animations API) */
  private flyToCart(from: HTMLElement, imageUrl: string) {
    const target = document.querySelector<HTMLElement>(CART_TARGET_SELECTOR);
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = from.getBoundingClientRect();
    const end = target.getBoundingClientRect();
    const size = Math.min(start.width, 120);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    Object.assign(img.style, {
      position: 'fixed',
      left: `${start.left + start.width / 2 - size / 2}px`,
      top: `${start.top + start.height / 2 - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      objectFit: 'contain',
      pointerEvents: 'none',
      zIndex: '70',
      filter: 'drop-shadow(0 8px 12px rgb(0 0 0 / 0.3))',
    });
    document.body.appendChild(img);

    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);

    img.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        // Titik tengah sedikit naik, supaya lintasannya melengkung
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.6)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.2 },
      ],
      { duration: 650, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' }
    ).finished.finally(() => img.remove());
  }
}
