/**
 * Bentuk data pesanan di Firebase (`formSubmissions`).
 * Pesanan lama tidak punya unitPrice/total/createdAt, dan satu baris bisa berisi
 * beberapa nama (opsi lama "beli semua evolusi"), jadi field-field itu opsional.
 */
export interface OrderLine {
  pokemon: string[];
  quantity: number;    // jumlah kartu di baris ini (untuk baris lama: total semua evolusi)
  unitPrice?: number;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode?: string;
  phone: string;
  address: string;
  pokemonToBuy: OrderLine[];
  total?: number;
  createdAt?: string;
}

/** Ubah object Firebase { "-Nabc": {...}, ... } menjadi array Order, terbaru dulu */
export function ordersFromFirebase(response: Record<string, any> | null): Order[] {
  return Object.entries(response ?? {})
    .map(([id, data]) => ({ ...data, id, pokemonToBuy: data.pokemonToBuy ?? [] }) as Order)
    // Push ID Firebase disusun dari waktu pembuatan, jadi urutan teksnya = urutan waktu
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function orderCardCount(order: Order): number {
  return order.pokemonToBuy.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
}

/** Semua nama Pokémon unik dalam satu atau beberapa pesanan */
export function orderPokemonNames(orders: Order[]): string[] {
  return [...new Set(orders.flatMap(order => order.pokemonToBuy.flatMap(line => line.pokemon)))];
}

/** Jumlah per Pokémon dalam satu baris (baris lama "semua evolusi" dibagi rata) */
export function quantityPerPokemon(line: OrderLine): number {
  return Math.max(1, Math.round(line.quantity / Math.max(1, line.pokemon.length)));
}
