import { map } from 'rxjs';
import { RealtimeDatabaseService } from './../../../../services/realtime-database.service';
import { PokemonService } from './../../../../services/pokemon.service';
import { Component, Input, OnInit, Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-submission-edit',
  templateUrl: './form-submission-edit.component.html',
  standalone: false

})
export default class FormSubmissionEditComponent implements OnInit{
  fetchedData: any;
  selectedPokemons: any[] = [];
  isFormSuccess: boolean = false;
  showModal: boolean = false;

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

    this.selectedPokemons = await Promise.all(this.fetchedData.pokemonToBuy.map(async (pokemon: any) => {
      const details = await this.pokemonService.getPokemonDetailsByName(pokemon);
      return details;
    }));
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
      pokemonToBuy: this.selectedPokemons.map(pokemon => pokemon.name)
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
    this.selectedPokemons.splice(index, 1);
  }

  closeSuccessModal(e : Event){
    e.preventDefault();
    this.showModal = !this.showModal;
    console.log(this.showModal);
  }

}
