import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { RealtimeDatabaseService } from '../../services/realtime-database.service';
import { Router } from 'express';
import { Store } from '@ngrx/store';
import { CartItem } from '../../state/cart/cart.state';
import { Observable, map } from 'rxjs';
import { clearCart } from '../../state/cart/cart.action';

@Component({
  selector: 'app-checkout',
  standalone: false,

  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent  implements OnInit {

 checkoutForm: FormGroup;
 cartItems$: Observable<CartItem[]>;
 cartItems: CartItem[] = [];
 evolutionOptions: Record<string, any> = {};
 displayedPokemons: any[][] = [];
 formSubmitted: boolean = false;

  constructor(
    private pokemonService: PokemonService,
    private dbService:RealtimeDatabaseService,
    private fb: FormBuilder,
    private store: Store<{ cart: CartItem[] }>,

  ) {
    this.cartItems$ = this.store.select('cart');
    this.checkoutForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneCountryCode: new FormControl('+62', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
      address: new FormControl('', [Validators.required]),
      pokemonSelections: this.fb.array([]),
    });
  }

  get pokemonSelections(): FormArray<FormGroup>{
    return this.checkoutForm.get('pokemonSelections') as FormArray<FormGroup>;
  }

  onSubmit() {
  }

  async ngOnInit(): Promise<void> {
    this.cartItems$.subscribe(async items => {
      if(!items || items.length === 0){
        console.warn('No items in cart');
        this.cartItems = [];
        return;
      }
      this.cartItems = items;
      await this.initEvolutionsOpt();
    } );
  }

  private async initEvolutionsOpt(): Promise<void>{

      for (const item of this.cartItems) {
        try {
          const species = await this.pokemonService.getPokemonSpecies(item.pokemon.name);
          const evoUrl = species.evolution_chain.url;
          const evolutions = await this.pokemonService.getEvolutions(evoUrl);

          this.evolutionOptions[item.pokemon.name] = evolutions;

          this.pokemonSelections.push(this.fb.group({
            buyOption: ['1', Validators.required],
            quantity: [
              item.quantity, Validators.required
            ],}));

          const replicatedPokemon =  [];
          for(let i = 0; i < item.quantity; i++){
            replicatedPokemon.push(item.pokemon);
          }
          this.displayedPokemons.push(replicatedPokemon);
        } catch (error) {
          // console.error('Error getting evolutions:', error);
        }
      };

  }

  updateDisplayedPokemons(index: number){
    const buyOption = this.pokemonSelections.at(index).get('buyOption')?.value;

    const baseQuantity = this.cartItems[index].quantity;
    const selectedPokemon =
      buyOption === '1' ? [this.cartItems[index].pokemon]
      : this.evolutionOptions[this.cartItems[index].pokemon.name];

     // Update displayed Pokémon: replicate each selected Pokémon by baseQuantity
     const replicatedPokemon = [];
     for (let i = 0; i < baseQuantity; i++) {
       replicatedPokemon.push(...selectedPokemon);
     }
     this.displayedPokemons[index] = replicatedPokemon;

     // Update quantity to match the total number of displayed Pokémon
     const totalQuantity = replicatedPokemon.length;

     this.pokemonSelections.at(index).patchValue({
       quantity: totalQuantity,
     });
  }

  async submitOrder(): Promise<void>{
    if(this.checkoutForm.invalid){
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const formValues = this.checkoutForm.value;

    const pokemonToBuy = this.cartItems.map((item, index) => {
      const buyOption = this.pokemonSelections.at(index).get('buyOption')?.value;
      const selectedPokemon = buyOption === '1' ? [item.pokemon.name]
      : this.evolutionOptions[item.pokemon.name].map((evo:any) => evo.name);
      return {
        pokemon: selectedPokemon,
        quantity: this.pokemonSelections.at(index).get('quantity')?.value,
      }
    });

    const orderData = {
      ...formValues,
      pokemonToBuy,
    }

    try {
      await this.dbService.saveFormSubmission(orderData);
      this.formSubmitted = true;
      this.store.dispatch(clearCart());
    } catch (error) {
      console.error('Error saving form submission:', error);
    }

  }

  closeModal(){
    this.formSubmitted = false;
  }
}
