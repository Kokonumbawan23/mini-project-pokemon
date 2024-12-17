import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pokemon-card',
  standalone: false,

  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css'
})
export class PokemonCardComponent {
  @Input() pokemon: any;
  @Input() theme: 'light' | 'dark' = 'light';
  evolutions: any[] = [];

}
