// `import type` hilang saat kompilasi, jadi tidak membuat import melingkar dengan tcg-card
import type { TcgCardData } from '../components/tcg-card/tcg-card.component';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'holo';

/** Kartu yang bisa dijual: data tampilan kartu + harga */
export interface Product extends TcgCardData {
  total: number;   // total base stats
  rarity: Rarity;
  price: number;   // dalam Rupiah
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  holo: 'Holo Rare',
};

/** Simbol kelangkaan seperti yang tercetak di pojok kartu TCG asli */
export const RARITY_SYMBOL: Record<Rarity, string> = {
  common: '●',
  uncommon: '◆',
  rare: '★',
  holo: '★H',
};

export function rarityFor(total: number): Rarity {
  if (total < 330) return 'common';
  if (total < 430) return 'uncommon';
  if (total < 520) return 'rare';
  return 'holo';
}

/**
 * Harga naik secara kuadrat terhadap total stats, dibulatkan ke ribuan.
 * Contoh: Caterpie (195) ≈ Rp 17.000, Ivysaur (405) ≈ Rp 75.000, Mewtwo (680) ≈ Rp 210.000.
 */
export function priceFor(total: number): number {
  const raw = (total * total) / 2.2;
  return Math.max(10_000, Math.round(raw / 1000) * 1000);
}

/** Ubah respons /pokemon/{name} dari PokeAPI menjadi Product */
export function productFromApi(pokemon: any): Product {
  const total = pokemon.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.other['official-artwork'].front_default ?? pokemon.sprites.front_default,
    types: pokemon.types.map((t: any) => t.type.name),
    hp: pokemon.stats.find((s: any) => s.stat.name === 'hp')?.base_stat,
    total,
    rarity: rarityFor(total),
    price: priceFor(total),
  };
}
