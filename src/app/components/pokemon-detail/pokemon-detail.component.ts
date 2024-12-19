import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from './../../services/pokemon.service';
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { addCart } from '../../state/cart/cart.action';

@Component({
  selector: 'app-pokemon-detail',
  standalone: false,

  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css'
})
export class PokemonDetailComponent implements OnInit{
    pokemon: any;
    @Input() theme: 'light' | 'dark' = 'light';
    evolutionChain: any;
    species: any;
    evolutions: any[] = [];
    showForm: boolean = false;
    isFormDirty: boolean = false;

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
            const url = current.species.url;
            evolutions.push({name, url});
            current = current.evolves_to[0];
        }
        return evolutions;

    }

    async wrapper(name: string){

        this.pokemon = await this.pokemonService.getPokemonDetailsByName(name);
        this.species = await this.pokemonService.getPokemonSpecies(name);
        this.evolutionChain = await this.pokemonService.getEvolutions(this.species.evolution_chain.url);
        this.evolutions = this.parseEvolutions(this.evolutionChain);

    }

    async selectPokemon(name: string) {
      this.router.navigate([`/pokemon-detail/${name}`]);
    }

    buyCard(){
      this.showForm = true;
    }

    addToCart(){
      this.store.dispatch(addCart({pokemon: this.pokemon, quantity: 1}));
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
