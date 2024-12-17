import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { PokemonService } from "../../services/pokemon.service";
import e from "express";

@Component({
  selector: "app-pokemon-list",
  templateUrl: "./pokemon-list.component.html",
  styleUrls: ["./pokemon-list.component.css"],
  standalone: false
})
export class PokemonListComponent implements OnInit, OnDestroy, OnChanges {

  pokemonList: any[] = [];
  filteredPokemon: any[] = [];
  paginatedPokemon: any[] = [];
  selectedPokemon: any;
  selectedElement: string = "";
  theme: "light" | "dark" = "light";
  filter: string = "";
  elements: string[] = ["fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
  currentPage: number = 1;
  lastLoadedPage: number = 1;
  lastTotalPage: number = 1;
  itemsPerPage: number = 8;
  totalPage: number = 20;


  constructor(private pokemonService: PokemonService) {
  }

  async fetchPokemon(){
    const response = await this.pokemonService.getPokemonList(160);
    this.pokemonList = await Promise.all(
      response.map(async (pokemon: any): Promise<{
        name: string;
        url: string;
        image: string;
        shinyImage: string;
        id: number;
        elements: any[];
      }> => {
        const details = await this.pokemonService.getPokemonDetails(pokemon.url);
        return {
          name: pokemon.name,
          url: pokemon.url,
          image: details.sprites.front_default,
          shinyImage: details.sprites.front_shiny,
          id: details.id,
          elements: details.types
        }
      })
    );
    this.filteredPokemon = this.pokemonList;
    this.lastTotalPage = this.totalPage;
    this.paginate();
  }

  async ngOnInit() {
    await this.fetchPokemon();
  }

  async ngOnChanges(changes: SimpleChanges) {
  }

  async ngOnDestroy() {
  }

  applyFilter():void{
    if(this.filter === "" && this.selectedElement === ""){
      this.filteredPokemon = this.pokemonList;
      this.currentPage = this.lastLoadedPage;
      this.totalPage = this.lastTotalPage;
      return;
    }
    this.filteredPokemon = this.pokemonList.filter(pokemon => {
        const matchesName = pokemon.name.toLowerCase().includes(this.filter.toLowerCase());
        const matchesElement = !this.selectedElement || pokemon.elements.some((element: any) => element.type.name === this.selectedElement);
      return matchesName && matchesElement;
    });
    this.currentPage = 1;

    this.paginatedPokemon = this.filteredPokemon.slice(0, this.itemsPerPage);
    this.totalPage = Math.ceil(this.filteredPokemon.length / this.itemsPerPage);
  }


  updatePagination(){
    this.totalPage = Math.ceil(this.filteredPokemon.length / this.itemsPerPage);
    }

  paginate(){
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedPokemon = this.filteredPokemon.slice(start, end);
  }

  nextPage(){
    console.log(this.currentPage);
    if(this.currentPage < this.totalPage){
      this.currentPage++;
      this.lastLoadedPage = this.currentPage;
      this.paginate();
    }
  }

  previousPage(){
    if(this.currentPage > 1){
      this.currentPage--;
      this.lastLoadedPage = this.currentPage;
      this.paginate();
    }
  }

  async selectPokemon(url:string){
    this.selectedPokemon = await this.pokemonService.getPokemonDetails(url);
  }



  closeModal(e: Event){
    if((e.target as HTMLElement).id === "shiny-button" ){
      return;
    }
    this.selectedPokemon = null;
  }

  toggleThemes(){
    this.theme = this.theme === "light" ? "dark" : "light";
  }
}
