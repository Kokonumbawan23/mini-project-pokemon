import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

/**
 * Akses ke PokeAPI dengan cache di memori.
 *
 * Data PokeAPI tidak pernah berubah selama aplikasi berjalan, jadi setiap URL cukup diambil sekali.
 * Yang disimpan adalah Promise-nya, bukan hasilnya: kalau dua komponen meminta URL yang sama
 * bersamaan, mereka berbagi satu request yang sama (tidak ada request ganda).
 */
@Injectable({
  providedIn: "root"
})
export class PokemonService {
  private http = inject(HttpClient);
  private apiUrl = "https://pokeapi.co/api/v2";
  private cache = new Map<string, Promise<any>>();

  getPokemonList(limit: number = 20): Promise<any[]> {
    return this.get(`${this.apiUrl}/pokemon?limit=${limit}`).then(data => data.results);
  }

  getPokemonDetails(url: string): Promise<any> {
    return this.get(url, slimPokemon);
  }

  getPokemonDetailsByName(nameOrId: string | number): Promise<any> {
    return this.get(`${this.apiUrl}/pokemon/${nameOrId}`, slimPokemon);
  }

  getPokemonSpecies(nameOrId: string | number): Promise<any> {
    return this.get(`${this.apiUrl}/pokemon-species/${nameOrId}`, slimSpecies);
  }

  getEvolutions(url: string): Promise<any> {
    return this.get(url);
  }

  /**
   * Ambil URL (sekali saja), lalu simpan hasil yang sudah "dirampingkan".
   * @param slim fungsi untuk membuang field besar yang tidak dipakai aplikasi
   */
  private get(url: string, slim: (data: any) => any = data => data): Promise<any> {
    // URL dengan dan tanpa garis miring di akhir dianggap sama
    const key = url.replace(/\/$/, '');
    const cached = this.cache.get(key);
    if (cached) return cached;

    const request = firstValueFrom(this.http.get<any>(url)).then(slim);
    this.cache.set(key, request);
    // Kalau gagal, hapus dari cache supaya permintaan berikutnya bisa mencoba lagi
    request.catch(() => this.cache.delete(key));
    return request;
  }
}

/**
 * Respons /pokemon/{id} bisa ratusan KB, kebanyakan dari `moves`.
 * Aplikasi ini tidak memakainya, jadi dibuang sebelum disimpan di cache.
 */
function slimPokemon({ moves, game_indices, held_items, past_abilities, past_types, ...rest }: any) {
  return rest;
}

/** Hanya teks berbahasa Inggris yang dipakai dari data species */
function slimSpecies(species: any) {
  return {
    ...species,
    flavor_text_entries: species.flavor_text_entries.filter((f: any) => f.language.name === 'en').slice(0, 1),
    genera: species.genera.filter((g: any) => g.language.name === 'en'),
    names: [],
    pokedex_numbers: [],
  };
}
