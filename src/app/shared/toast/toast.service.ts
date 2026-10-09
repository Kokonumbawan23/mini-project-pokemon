import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  action?: () => void;
}

/**
 * Notifikasi singkat di bagian bawah layar.
 * State disimpan dalam signal: komponen yang membaca `toasts()` otomatis ikut ter-update.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Hanya bisa dibaca dari luar; ubah lewat show() / dismiss() */
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, options: { actionLabel?: string; action?: () => void; duration?: number } = {}): number {
    const id = this.nextId++;
    const toast: Toast = { id, message, actionLabel: options.actionLabel, action: options.action };

    // Maksimal 3 toast sekaligus; yang paling lama dibuang
    this._toasts.update(list => [...list, toast].slice(-3));
    this.timers.set(id, setTimeout(() => this.dismiss(id), options.duration ?? 5000));
    return id;
  }

  dismiss(id: number) {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  runAction(toast: Toast) {
    toast.action?.();
    this.dismiss(toast.id);
  }
}
