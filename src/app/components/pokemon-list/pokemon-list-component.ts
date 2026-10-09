import { Component, OnInit } from "@angular/core";
import { PokemonService } from "../../services/pokemon.service";
import { TcgCardData } from "../tcg-card/tcg-card.component";

type SortKey = 'id' | 'name' | 'total' | 'hp' | 'attack' | 'defense' | 'speed' | 'height' | 'weight';
type TypeCount = 'any' | 'single' | 'dual';

@Component({
  selector: "app-pokemon-list",
  templateUrl: "./pokemon-list.component.html",
  styleUrls: ["./pokemon-list.component.css"],
  standalone: false
})
export class PokemonListComponent implements OnInit {

  pokemonList: any[] = [];
  filteredPokemon: any[] = [];
  paginatedPokemon: any[] = [];
  isLoading: boolean = true;

  // --- Search, filter & sort state ---
  filter: string = "";
  selectedTypes: string[] = [];
  typeCount: TypeCount = 'any';
  minTotal: number = 0;
  sortKey: SortKey = 'id';
  sortDir: 'asc' | 'desc' = 'asc';
  showFilters: boolean = false;

  readonly maxTotal = 720;
  readonly elements: string[] = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
  readonly sortOptions: { value: SortKey; label: string }[] = [
    { value: 'id', label: 'number' },
    { value: 'name', label: 'name' },
    { value: 'total', label: 'total stats' },
    { value: 'hp', label: 'HP' },
    { value: 'attack', label: 'attack' },
    { value: 'defense', label: 'defense' },
    { value: 'speed', label: 'speed' },
    { value: 'height', label: 'height' },
    { value: 'weight', label: 'weight' },
  ];
  readonly typeCountOptions: { value: TypeCount; label: string }[] = [
    { value: 'any', label: 'All' },
    { value: 'single', label: 'Single' },
    { value: 'dual', label: 'Dual' },
  ];

  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 9; // binder 9 kantong (3 × 3)
  totalPage: number = 1;
  skeletons = Array(9);
  /** Arah animasi saat halaman binder dibalik */
  flipDir: 'next' | 'prev' | 'none' = 'none';

  constructor(private pokemonService: PokemonService) {
  }

  async fetchPokemon(){
    this.isLoading = true;
    const response = await this.pokemonService.getPokemonList(160);
    this.pokemonList = await Promise.all(
      response.map(async (pokemon: any) => {
        const details = await this.pokemonService.getPokemonDetails(pokemon.url);
        // Ubah array stats [{stat:{name:'hp'}, base_stat: 45}, ...] jadi object { hp: 45, ... }
        const stats: Record<string, number> = {};
        for (const s of details.stats) {
          stats[s.stat.name] = s.base_stat;
        }
        return {
          name: pokemon.name,
          url: pokemon.url,
          image: details.sprites.other['official-artwork'].front_default ?? details.sprites.front_default,
          id: details.id,
          elements: details.types,
          height: details.height,
          weight: details.weight,
          stats,
          total: details.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0),
          // Data siap pakai untuk <app-tcg-card>
          card: {
            id: details.id,
            name: pokemon.name,
            image: details.sprites.other['official-artwork'].front_default ?? details.sprites.front_default,
            types: details.types.map((t: any) => t.type.name),
            hp: stats['hp'],
          } satisfies TcgCardData,
        }
      })
    );
    this.isLoading = false;
    this.applyFilter();
  }

  async ngOnInit() {
    await this.fetchPokemon();
  }

  /**
   * Pipeline: filter → sort → paginate.
   * Dipanggil setiap kali salah satu input search/filter/sort berubah.
   */
  applyFilter():void{
    const keyword = this.filter.trim().toLowerCase();

    const filtered = this.pokemonList.filter(pokemon => {
      const typeNames: string[] = pokemon.elements.map((e: any) => e.type.name);

      const matchesKeyword = !keyword || pokemon.name.includes(keyword) || String(pokemon.id) === keyword;
      // Semua tipe yang dipilih harus dimiliki (fire + flying → hanya yang punya keduanya)
      const matchesTypes = this.selectedTypes.every(t => typeNames.includes(t));
      const matchesTypeCount =
        this.typeCount === 'any' ||
        (this.typeCount === 'single' && typeNames.length === 1) ||
        (this.typeCount === 'dual' && typeNames.length === 2);
      const matchesTotal = pokemon.total >= this.minTotal;

      return matchesKeyword && matchesTypes && matchesTypeCount && matchesTotal;
    });

    this.filteredPokemon = this.sortPokemon(filtered);
    this.flipDir = 'none';
    this.currentPage = 1;
    this.totalPage = Math.max(1, Math.ceil(this.filteredPokemon.length / this.itemsPerPage));
    this.paginate();
  }

  private sortPokemon(list: any[]): any[] {
    const direction = this.sortDir === 'asc' ? 1 : -1;
    const valueOf = (p: any): number | string => {
      switch (this.sortKey) {
        case 'id':
        case 'name':
        case 'total':
        case 'height':
        case 'weight':
          return p[this.sortKey];
        default:
          return p.stats[this.sortKey];
      }
    };

    // [...list] supaya array asli tidak ikut terurut (sort() mengubah array aslinya)
    return [...list].sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      const result = typeof va === 'string'
        ? va.localeCompare(vb as string)
        : (va as number) - (vb as number);
      // Kalau nilainya sama, urutkan berdasarkan nomor supaya hasilnya stabil
      return (result || a.id - b.id) * direction;
    });
  }

  /** Teks kecil di kartu yang menunjukkan nilai yang sedang dipakai untuk sort, mis. "ATK 130" */
  sortBadge(pokemon: any): string | null {
    switch (this.sortKey) {
      case 'id':
      case 'name':
        return null;
      case 'total':
        return `BST ${pokemon.total}`;
      case 'height':
        return `${pokemon.height / 10} m`;
      case 'weight':
        return `${pokemon.weight / 10} kg`;
      default: {
        const short: Record<string, string> = { hp: 'HP', attack: 'ATK', defense: 'DEF', speed: 'SPD' };
        return `${short[this.sortKey]} ${pokemon.stats[this.sortKey]}`;
      }
    }
  }

  // --- Handler dari template ---

  toggleType(type: string){
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    } else if (this.selectedTypes.length < 2) {
      // Pokémon maksimal punya 2 tipe, jadi lebih dari 2 pasti hasilnya kosong
      this.selectedTypes = [...this.selectedTypes, type];
    }
    this.applyFilter();
  }

  isTypeDisabled(type: string): boolean {
    return this.selectedTypes.length >= 2 && !this.selectedTypes.includes(type);
  }

  toggleSortDir(){
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.applyFilter();
  }

  get activeFilterCount(): number {
    return this.selectedTypes.length + (this.typeCount !== 'any' ? 1 : 0) + (this.minTotal > 0 ? 1 : 0);
  }

  get hasActiveCriteria(): boolean {
    return this.activeFilterCount > 0 || this.filter.trim() !== '' || this.sortKey !== 'id' || this.sortDir !== 'asc';
  }

  clearKeyword(){
    this.filter = '';
    this.applyFilter();
  }

  clearTypeCount(){
    this.typeCount = 'any';
    this.applyFilter();
  }

  clearMinTotal(){
    this.minTotal = 0;
    this.applyFilter();
  }

  resetAll(){
    this.filter = '';
    this.selectedTypes = [];
    this.typeCount = 'any';
    this.minTotal = 0;
    this.sortKey = 'id';
    this.sortDir = 'asc';
    this.applyFilter();
  }

  // --- Pagination ---

  paginate(){
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedPokemon = this.filteredPokemon.slice(start, end);
  }

  nextPage(){
    if(this.currentPage < this.totalPage){
      this.flipDir = 'next';
      this.currentPage++;
      this.paginate();
    }
  }

  previousPage(){
    if(this.currentPage > 1){
      this.flipDir = 'prev';
      this.currentPage--;
      this.paginate();
    }
  }
}
