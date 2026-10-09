import { Component, DestroyRef, ElementRef, HostListener, OnInit, ViewChild, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { PokemonService } from "../../services/pokemon.service";
import { CartActionsService } from "../../services/cart-actions.service";
import { BinderStateService } from "../../services/binder-state.service";
import { Product, productFromApi, Rarity, RARITY_LABEL, RARITY_SYMBOL } from "../../shared/product";

type SortKey = 'id' | 'name' | 'price' | 'total' | 'hp' | 'attack' | 'defense' | 'speed' | 'height' | 'weight';
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
  selectedRarities: Rarity[] = [];
  sortKey: SortKey = 'id';
  sortDir: 'asc' | 'desc' = 'asc';
  showFilters: boolean = false;

  readonly maxTotal = 720;
  readonly elements: string[] = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
  readonly sortOptions: { value: SortKey; label: string }[] = [
    { value: 'id', label: 'number' },
    { value: 'name', label: 'name' },
    { value: 'price', label: 'price' },
    { value: 'total', label: 'total stats' },
    { value: 'hp', label: 'HP' },
    { value: 'attack', label: 'attack' },
    { value: 'defense', label: 'defense' },
    { value: 'speed', label: 'speed' },
    { value: 'height', label: 'height' },
    { value: 'weight', label: 'weight' },
  ];
  readonly rarities: { value: Rarity; label: string; symbol: string }[] =
    (['common', 'uncommon', 'rare', 'holo'] as Rarity[]).map(r => ({ value: r, label: RARITY_LABEL[r], symbol: RARITY_SYMBOL[r] }));
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

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private binderState = inject(BinderStateService);
  /** Kriteria filter terakhir yang ditampilkan, untuk menentukan arah animasi */
  private lastCriteria = '';
  private lastPage = 1;

  constructor(private pokemonService: PokemonService, private cartActions: CartActionsService) {
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
          // Data kartu + harga, dipakai oleh <app-tcg-card> dan saat masuk ke cart
          card: productFromApi(details) as Product,
        }
      })
    );
    this.isLoading = false;
    this.runPipeline();
  }

  async ngOnInit() {
    // URL adalah sumber kebenaran: setiap kali query params berubah (klik filter,
    // tombol Back, refresh, atau link yang dibagikan), baca ulang state lalu tampilkan.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.readStateFromUrl(params);
        this.binderState.lastQueryParams = this.route.snapshot.queryParams;
        if (!this.isLoading) this.runPipeline();
      });

    await this.fetchPokemon();
  }

  // --- Sinkronisasi state ↔ URL ---

  /** Isi state komponen dari query params, dengan validasi (URL bisa diketik sembarangan) */
  private readStateFromUrl(params: ParamMap) {
    const get = (key: string) => params.get(key) ?? '';
    const list = (key: string) => get(key).split(',').filter(Boolean);

    this.filter = get('q');
    this.selectedTypes = list('type').filter(t => this.elements.includes(t)).slice(0, 2);
    this.selectedRarities = list('rarity').filter((r): r is Rarity => this.rarities.some(o => o.value === r));
    this.typeCount = this.typeCountOptions.find(o => o.value === get('count'))?.value ?? 'any';
    const min = Math.round(Number(get('min')) / 10) * 10;
    this.minTotal = Number.isFinite(min) ? Math.min(Math.max(min, 0), this.maxTotal) : 0;
    this.sortKey = this.sortOptions.find(o => o.value === get('sort'))?.value ?? 'id';
    this.sortDir = get('dir') === 'desc' ? 'desc' : 'asc';
    this.currentPage = Math.max(1, parseInt(get('page'), 10) || 1);
  }

  /**
   * Tulis state saat ini ke URL. Nilai default tidak ditulis, supaya URL tetap pendek.
   * replaceUrl: tidak menambah entri history di setiap ketikan; tombol Back tetap
   * kembali ke halaman sebelumnya (mis. dari detail kembali ke binder dengan filter yang sama).
   */
  updateUrl(page = 1) {
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        // Jangan di-trim: nilai ini dibaca balik ke kolom search, spasi yang sedang diketik harus tetap ada
        q: this.filter || null,
        type: this.selectedTypes.join(',') || null,
        rarity: this.selectedRarities.join(',') || null,
        count: this.typeCount !== 'any' ? this.typeCount : null,
        min: this.minTotal > 0 ? this.minTotal : null,
        sort: this.sortKey !== 'id' ? this.sortKey : null,
        dir: this.sortDir !== 'asc' ? this.sortDir : null,
        page: page > 1 ? page : null,
      },
    });
  }

  /**
   * Pipeline: filter → sort → paginate.
   * Dijalankan setiap kali URL berubah, dan sekali setelah data selesai dimuat.
   */
  private runPipeline():void{
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
      const matchesRarity = !this.selectedRarities.length || this.selectedRarities.includes(pokemon.card.rarity);

      return matchesKeyword && matchesTypes && matchesTypeCount && matchesTotal && matchesRarity;
    });

    this.filteredPokemon = this.sortPokemon(filtered);
    this.totalPage = Math.max(1, Math.ceil(this.filteredPokemon.length / this.itemsPerPage));
    // Halaman dari URL bisa melebihi jumlah halaman (mis. link lama); batasi
    this.currentPage = Math.min(this.currentPage, this.totalPage);

    // Animasi balik halaman hanya kalau kriterianya sama dan yang berubah cuma halaman
    const criteria = JSON.stringify([keyword, this.selectedTypes, this.selectedRarities, this.typeCount, this.minTotal, this.sortKey, this.sortDir]);
    this.flipDir = criteria !== this.lastCriteria || this.currentPage === this.lastPage
      ? 'none'
      : this.currentPage > this.lastPage ? 'next' : 'prev';
    this.lastCriteria = criteria;
    this.lastPage = this.currentPage;

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
        case 'price':
          return p.card.price;
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
      case 'price': // harga sudah tampil di stiker
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
    this.updateUrl();
  }

  toggleRarity(rarity: Rarity){
    this.selectedRarities = this.selectedRarities.includes(rarity)
      ? this.selectedRarities.filter(r => r !== rarity)
      : [...this.selectedRarities, rarity];
    this.updateUrl();
  }

  isTypeDisabled(type: string): boolean {
    return this.selectedTypes.length >= 2 && !this.selectedTypes.includes(type);
  }

  toggleSortDir(){
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.updateUrl();
  }

  get activeFilterCount(): number {
    return this.selectedTypes.length + this.selectedRarities.length + (this.typeCount !== 'any' ? 1 : 0) + (this.minTotal > 0 ? 1 : 0);
  }

  get hasActiveCriteria(): boolean {
    return this.activeFilterCount > 0 || this.filter.trim() !== '' || this.sortKey !== 'id' || this.sortDir !== 'asc';
  }

  clearKeyword(){
    this.filter = '';
    this.updateUrl();
  }

  clearTypeCount(){
    this.typeCount = 'any';
    this.updateUrl();
  }

  clearMinTotal(){
    this.minTotal = 0;
    this.updateUrl();
  }

  resetAll(){
    this.filter = '';
    this.selectedTypes = [];
    this.selectedRarities = [];
    this.typeCount = 'any';
    this.minTotal = 0;
    this.sortKey = 'id';
    this.sortDir = 'asc';
    this.updateUrl();
  }

  // --- Cart ---

  quickAdd(product: Product, cardElement: HTMLElement) {
    this.cartActions.add([product], cardElement);
  }

  // --- Keyboard ---

  /** ← → membalik halaman binder, / langsung ke kolom search */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
    if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'ArrowRight') {
      this.nextPage();
    } else if (event.key === 'ArrowLeft') {
      this.previousPage();
    } else if (event.key === '/') {
      event.preventDefault(); // jangan sampai karakter "/" ikut terketik
      this.searchInput?.nativeElement.focus();
    }
  }

  // --- Pagination ---

  paginate(){
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedPokemon = this.filteredPokemon.slice(start, end);
  }

  nextPage(){
    if(this.currentPage < this.totalPage){
      this.updateUrl(this.currentPage + 1);
    }
  }

  previousPage(){
    if(this.currentPage > 1){
      this.updateUrl(this.currentPage - 1);
    }
  }
}
