import { RealtimeDatabaseService } from './../../services/realtime-database.service';
import { PokemonService } from './../../services/pokemon.service';
import { Component, Input, OnInit, Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CanComponentDeactivate } from '../../guards/form.guard';

@Component({
  selector: 'app-pokemon-forms',
  templateUrl: './pokemon-forms.component.html',
  standalone: false

})
export default class PokemonFormsComponent implements OnInit, CanComponentDeactivate{
  @Input() isOpened: boolean = false;
  @Output() isOpenedChange = new EventEmitter<boolean>();
  @Output() formStates = new EventEmitter<boolean>();
  @Input() evolutions: any[] = [];
  @Input() pokemon: any;
  selectedPokemons: any[] = [];
  isFormSuccess: boolean = false;
  showModal: boolean = false;
  dirty: boolean = false;

  buyForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneCountryCode: new FormControl('+62', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    address: new FormControl('', [Validators.required]),
    buyOptions: new FormControl('', [Validators.required]),
  });

  constructor(private pokemonService: PokemonService, private dbService:RealtimeDatabaseService) {}

  ngOnInit(): void {
      this.buyForm.valueChanges.subscribe(() => {
        this.dirty = true;
        this.formStates.emit(this.dirty);
      });
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
      this.dbService.saveFormSubmission(data);
      console.log('Form submission saved successfully!');
      this.isFormSuccess = true;
      this.showModal = true;
    }catch(error){
      console.error('Error saving form submission:', error);
      this.isFormSuccess = false;
      this.showModal = true;

    }

  }

  closeForm() {
    this.isOpened = false;
    this.isOpenedChange.emit(false);
  }

  closeSuccessModal(e : Event){
    e.preventDefault();
    this.showModal = !this.showModal;
    console.log(this.showModal);
  }

  onBuyOptionChange() {
    this.selectedPokemons = [];
    if(this.buyForm.controls['buyOptions'].value === '1'){
      this.selectedPokemons = [this.pokemon];
    }else if(this.buyForm.controls['buyOptions'].value === 'all'){
      this.evolutions.map(async evolution => {
        const pokemon = await this.pokemonService.getPokemonDetailsByName(evolution.name);
        this.selectedPokemons.push(pokemon);
      });
    }
  }

canDeactivate():boolean {
  if(this.dirty){
    return confirm('Are you sure you want to leave this page?');
  }
  return true;
};

}
