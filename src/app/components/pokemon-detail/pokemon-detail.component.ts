import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from './../../services/pokemon.service';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { addCart } from '../../state/cart/cart.action';
import { TcgCardData } from '../tcg-card/tcg-card.component';

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
    card: TcgCardData | null = null;
    addedToCart: boolean = false;
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
    private store:Store
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

        // Dua request ini tidak saling bergantung, jadi dijalankan bersamaan
        const [pokemon, species] = await Promise.all([
          this.pokemonService.getPokemonDetailsByName(name),
          this.pokemonService.getPokemonSpecies(name),
        ]);
        this.pokemon = pokemon;
        this.species = species;

        // Ambil teks berbahasa Inggris dari data species
        this.genus = this.species.genera.find((g: any) => g.language.name === 'en')?.genus ?? '';
        const flavor = this.species.flavor_text_entries.find((f: any) => f.language.name === 'en')?.flavor_text ?? '';
        // Teks dari game mengandung karakter \n dan \f, rapikan jadi satu paragraf
        this.description = flavor.replace(/[\n\f\r]/g, ' ');
        this.totalStats = this.pokemon.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);

        this.card = {
          ...this.toCard(this.pokemon),
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
        this.evolutions = stages.map((stage, i) => ({ ...stage, card: this.toCard(details[i]) }));

    }

    /** Ubah respons PokeAPI jadi data kartu ukuran kecil */
    private toCard(pokemon: any): TcgCardData {
      return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other['official-artwork'].front_default ?? pokemon.sprites.front_default,
        types: pokemon.types.map((t: any) => t.type.name),
        hp: pokemon.stats.find((s: any) => s.stat.name === 'hp')?.base_stat,
      };
    }

    async selectPokemon(name: string) {
      this.router.navigate(['/pokemon/detail', name]);
    }

    buyCard(){
      this.showForm = true;
    }

    addToCart(){
      this.store.dispatch(addCart({pokemon: this.pokemon, quantity: 1}));
      // Feedback singkat di tombol supaya user tahu aksinya berhasil
      this.addedToCart = true;
      setTimeout(() => this.addedToCart = false, 1500);
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
