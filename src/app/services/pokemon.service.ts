import { Injectable } from "@angular/core";
import axios from "axios";

@Injectable({
  providedIn: "root"
})
export class PokemonService {
  private apiUrl: String = "https://pokeapi.co/api/v2/";

  constructor() {
    console.log("PokemonService constructor called");
  }

  async getPokemonList(limit: number = 20) {
    const response = await axios.get(`${this.apiUrl}/pokemon?limit=${limit}`);
    return response.data.results;
  }

  async getPokemonDetails(url: string) {
    const response = await axios.get(url);
    return response.data;
  }

  async getPokemonDetailsByName(name: string) {
    const response = await axios.get(`${this.apiUrl}/pokemon/${name}`);
    return response.data;
  }

  async getPokemonSpecies(name: string) {
    const response = await axios.get(`${this.apiUrl}/pokemon-species/${name}`);
    return response.data;
  }

  async getEvolutions(url: string) {
    const response = await axios.get(url);
    return response.data;
  }
}
