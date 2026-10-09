import { Component, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rarity, RARITY_LABEL, RARITY_SYMBOL } from '../../shared/product';

/** Data yang dibutuhkan untuk menggambar satu kartu. Field opsional hanya tampil di ukuran 'lg'. */
export interface TcgCardData {
  id: number;
  name: string;
  image: string;
  types: string[];
  hp?: number;
  genus?: string;
  height?: number;   // dalam meter
  weight?: number;   // dalam kilogram
  abilities?: string[];
  flavor?: string;
  rarity?: Rarity;
}

/**
 * Standalone supaya bisa dipakai di PokemonModule (binder, detail) dan AppModule (cart, checkout)
 * tanpa harus membuat shared NgModule.
 */
@Component({
  selector: 'app-tcg-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tcg-card.component.html',
  styleUrl: './tcg-card.component.css',
})
export class TcgCardComponent {
  @Input({ required: true }) card!: TcgCardData;
  @Input() size: 'sm' | 'lg' = 'sm';
  /** Aktifkan efek miring + kilau holo yang mengikuti kursor */
  @Input() interactive = false;
  /** Total kartu dalam "set", ditampilkan seperti nomor koleksi: 025/160 */
  @Input() collectorTotal: number | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  get primaryType(): string {
    return this.card.types[0] ?? 'normal';
  }

  readonly raritySymbol = RARITY_SYMBOL;
  readonly rarityLabel = RARITY_LABEL;

  get collectorNumber(): string {
    const no = String(this.card.id).padStart(3, '0');
    return this.collectorTotal ? `${no}/${this.collectorTotal}` : `No. ${no}`;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.interactive) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    // Posisi kursor dalam kartu, 0..1
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    // Simpan sebagai CSS variable; perhitungan visualnya ada di CSS
    const style = this.el.nativeElement.style;
    style.setProperty('--ry', `${(px - 0.5) * 18}deg`);
    style.setProperty('--rx', `${(0.5 - py) * 18}deg`);
    style.setProperty('--mx', `${px * 100}%`);
    style.setProperty('--my', `${py * 100}%`);
    style.setProperty('--holo', '1');
  }

  onPointerLeave() {
    if (!this.interactive) return;
    const style = this.el.nativeElement.style;
    style.setProperty('--ry', '0deg');
    style.setProperty('--rx', '0deg');
    style.setProperty('--holo', '0');
  }
}
