import { map } from 'rxjs';
import { RealtimeDatabaseService } from './../../../../services/realtime-database.service';
import { PokemonService } from './../../../../services/pokemon.service';
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { CanComponentDeactivate } from '../../../../guards/form.guard';

@Component({
  selector: 'app-form-submission-edit',
  templateUrl: './form-submission-edit.component.html',
  standalone: false

})
export default class FormSubmissionEditComponent implements OnInit, CanComponentDeactivate{
  fetchedData: any;
  isFormSuccess: boolean = false;
  showModal: boolean = false;
  dirty: boolean = false;
  pokemonList: any[] = [];
  displayedPokemons: any[] = [];

  buyForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneCountryCode: new FormControl('+62', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    address: new FormControl('', [Validators.required]),
  });

  constructor(private pokemonService: PokemonService,
    private dbService:RealtimeDatabaseService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if(id){
      const data = await this.dbService.getFormSubmission(id);
      this.fetchedData = data;
      this.buyForm.patchValue(data);
    }


    this.pokemonList= await Promise.all(
      this.fetchedData.pokemonToBuy.map(async (data: any) => {

        const pokemonData = await Promise.all(data.pokemon.map(async (pokemon: any) => {
          return await this.pokemonService.getPokemonDetailsByName(pokemon);
         }))
        data = {pokemon: pokemonData, quantity: data.quantity};

        const wrapper = [];
        // push to displayedPokemons based on quantity
        for(let i=0; i<data.quantity / data.pokemon.length; i++){
          // push to wrapper and make it into one array
          wrapper.push(...data.pokemon);
        }
        this.displayedPokemons.push({pokemon: wrapper, quantity: data.quantity});
        return data;
      })
    );

    this.buyForm.valueChanges.subscribe(() => {
      this.dirty = true;
    });
    console.log(this.displayedPokemons);
  }

  onSubmit() {
    if(this.buyForm.invalid){
      this.buyForm.markAllAsTouched();
      return;
    }

    const data = {
      firstName: this.buyForm.controls['firstName'].value,
      lastName: this.buyForm.controls['lastName'].value,
      email: this.buyForm.controls['email'].value,
      phone: this.buyForm.controls['phone'].value,
      address: this.buyForm.controls['address'].value,
      // pokemonToBuy: this.selectedPokemons.map(pokemon => pokemon.name)
    }

    try{
      const id = this.route.snapshot.paramMap.get('id') as string;
      this.dbService.updateFormSubmission(id, data);
      console.log('Form submission updated successfully!');
      this.isFormSuccess = true;
      this.showModal = true;
    }catch(error){
      console.error('Error occured when updating form submission:', error);
      this.isFormSuccess = false;
      this.showModal = true;

    }

  }

  removePokemon(e: Event,index: number){
    e.preventDefault();
    // this.selectedPokemons.splice(index, 1);
  }

  closeSuccessModal(e : Event){
    e.preventDefault();
    this.showModal = !this.showModal;
    console.log(this.showModal);
  }

  canDeactivate():boolean {
    if(this.dirty){
      return confirm('Are you sure you want to leave this page?');
    }
    return true;
  };

}
