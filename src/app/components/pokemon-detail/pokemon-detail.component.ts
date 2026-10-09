import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from './../../services/pokemon.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartActionsService } from '../../services/cart-actions.service';
import { Observable, of } from 'rxjs';
import { Product, productFromApi, RARITY_LABEL } from '../../shared/product';
import { selectQuantityInCart } from '../../state/cart/cart.selector';

@Component({
  selector: 'app-pokemon-detail',
  standalone: false,

  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css'
})
export class PokemonDetailComponent implements OnInit{
    pokemon: any;
    evolutionChain: any;
    species: any;
    evolutions: any[] = [];
    genus: string = '';
    description: string = '';
    totalStats: number = 0;
    card: Product | null = null;
    inCart$: Observable<number> = of(0);
    readonly rarityLabel = RARITY_LABEL;
    /** true selama data Pokémon berikutnya sedang dimuat */
    isLoading: boolean = false;
    /** Nomor urut permintaan; hanya hasil permintaan terakhir yang dipakai */
    private loadSeq = 0;
    readonly maxId = 1025; // jumlah Pokémon di National Pokédex
    @ViewChild('bigCard', { read: ElementRef }) bigCard?: ElementRef<HTMLElement>;
    showForm: boolean = false;
    isFormDirty: boolean = false;
    statLabels: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Speed',
    };

    constructor(
    private pokemonService: PokemonService,
    private route: ActivatedRoute,
    private router: Router,
    private store:Store,
    private cartActions: CartActionsService,
    ) {}

    async ngOnInit() {
      // Untuk subscribe (dengerin tiap ganti) parameter URL
      this.route.paramMap.subscribe(async params => {
        const name = params.get('name') as string;
        await this.wrapper(name);
      });
    }

    playCry() {
        const audio = new Audio(this.pokemon.cries.latest);
        audio.play();
    }

    parseEvolutions(evolutionChain: any) {
        const evolutions: any[] = [];
        let current = evolutionChain.chain;
        while(current){
            const name = current.species.name;
            const minLevel = current.evolution_details[0]?.min_level ?? null;
            evolutions.push({name, minLevel});
            current = current.evolves_to[0];
        }
        return evolutions;

    }

    async wrapper(name: string){
        const seq = ++this.loadSeq;
        this.isLoading = true;

        // Dua request ini tidak saling bergantung, jadi dijalankan bersamaan
        let pokemon: any, species: any;
        try {
          [pokemon, species] = await Promise.all([
            this.pokemonService.getPokemonDetailsByName(name),
            this.pokemonService.getPokemonSpecies(name),
          ]);
        } catch {
          if (seq === this.loadSeq) this.isLoading = false;
          return;
        }
        // User sudah pindah ke Pokémon lain selama menunggu → buang hasil ini
        if (seq !== this.loadSeq) return;
        this.isLoading = false;
        this.pokemon = pokemon;
        this.species = species;

        // Ambil teks berbahasa Inggris dari data species
        this.genus = this.species.genera.find((g: any) => g.language.name === 'en')?.genus ?? '';
        const flavor = this.species.flavor_text_entries.find((f: any) => f.language.name === 'en')?.flavor_text ?? '';
        // Teks dari game mengandung karakter \n dan \f, rapikan jadi satu paragraf
        this.description = flavor.replace(/[\n\f\r]/g, ' ');
        this.totalStats = this.pokemon.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);

        // Berapa kartu ini yang sudah ada di cart (ikut update otomatis lewat Store)
        this.inCart$ = this.store.select(selectQuantityInCart(this.pokemon.name));

        this.card = {
          ...productFromApi(this.pokemon),
          genus: this.genus,
          height: this.pokemon.height / 10,
          weight: this.pokemon.weight / 10,
          abilities: this.pokemon.abilities.map((a: any) => a.ability.name),
          flavor: this.description,
        };

        // Rantai evolusi: ambil detail tiap tahap (paralel) supaya kartunya punya HP & tipe
        this.evolutionChain = await this.pokemonService.getEvolutions(this.species.evolution_chain.url);
        const stages = this.parseEvolutions(this.evolutionChain);
        const details = await Promise.all(stages.map(stage => this.pokemonService.getPokemonDetailsByName(stage.name)));
        if (seq !== this.loadSeq) return;
        this.evolutions = stages.map((stage, i) => ({ ...stage, card: productFromApi(details[i]) }));

    }

    /** Total harga semua kartu di rantai evolusi */
    get evolutionLinePrice(): number {
      return this.evolutions.reduce((sum, ev) => sum + ev.card.price, 0);
    }

    async selectPokemon(name: string) {
      this.router.navigate(['/pokemon/detail', name]);
    }

    buyCard(){
      this.showForm = true;
    }

    addToCart(){
      if (!this.card) return;
      this.cartActions.add([this.card], this.bigCard?.nativeElement);
    }

    addEvolutionLine(){
      this.cartActions.add(this.evolutions.map(ev => ev.card), this.bigCard?.nativeElement);
    }

    // --- Pokémon sebelumnya / berikutnya ---

    get prevId(): number | null {
      return this.pokemon && this.pokemon.id > 1 ? this.pokemon.id - 1 : null;
    }

    get nextId(): number | null {
      return this.pokemon && this.pokemon.id < this.maxId ? this.pokemon.id + 1 : null;
    }

    goTo(id: number | null) {
      if (id) this.router.navigate(['/pokemon/detail', id]);
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'ArrowLeft') this.goTo(this.prevId);
      if (event.key === 'ArrowRight') this.goTo(this.nextId);
    }

    closeFormEvent(status: boolean){
      this.showForm = status;
    }

    receiveFormStates(eventValue: boolean){
      this.isFormDirty = eventValue;
    }

    canDeactivate():boolean {
      if(this.isFormDirty){
        return confirm('Are you sure you want to leave this page?');
      }
      return true;
    };

}
