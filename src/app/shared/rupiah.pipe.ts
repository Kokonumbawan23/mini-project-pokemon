import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/**
 * Format angka jadi Rupiah: 113000 → "Rp 113.000".
 * Standalone: bisa di-import langsung ke NgModule mana pun tanpa perlu dideklarasikan.
 */
@Pipe({
  name: 'rupiah',
  standalone: true,
})
export class RupiahPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '' : formatter.format(value);
  }
}
