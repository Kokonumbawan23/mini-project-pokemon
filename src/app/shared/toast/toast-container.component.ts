import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

/** Tempat semua toast ditampilkan. Pasang sekali di layout. */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" role="status">
          <span class="flex-1">{{ toast.message }}</span>
          @if (toast.actionLabel) {
            <button type="button" class="toast__action" (click)="toastService.runAction(toast)">
              {{ toast.actionLabel }}
            </button>
          }
          <button type="button" class="toast__close" aria-label="Dismiss" (click)="toastService.dismiss(toast.id)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      inset: auto 1rem 1rem 1rem;
      z-index: 60;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: min(100%, 26rem);
      padding: 0.75rem 0.5rem 0.75rem 1rem;
      border-radius: 0.75rem;
      background: #20243a;
      color: #fff;
      box-shadow: 0 10px 30px -10px rgb(0 0 0 / 0.5);
      pointer-events: auto;
      animation: toast-in 0.18s ease-out;
    }
    .toast__action {
      padding: 0.25rem 0.5rem;
      border-radius: 0.4rem;
      font-family: Archivo, sans-serif;
      font-weight: 700;
      color: #f4c73b;
    }
    .toast__action:hover { background: rgb(255 255 255 / 0.1); }
    .toast__close {
      width: 2rem;
      height: 2rem;
      border-radius: 0.4rem;
      color: rgb(255 255 255 / 0.6);
    }
    .toast__close:hover { color: #fff; background: rgb(255 255 255 / 0.1); }
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(8px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .toast { animation: none; }
    }
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
