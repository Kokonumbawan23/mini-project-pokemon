import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from './../../services/pokemon.service';
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs';

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

    constructor(
    private pokemonService: PokemonService,
    private route: ActivatedRoute,
    private router: Router
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

    closeFormEvent(status: boolean){
      this.showForm = status;
    }

}
