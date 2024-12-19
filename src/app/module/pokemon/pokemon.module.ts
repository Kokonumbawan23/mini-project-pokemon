import { NgModule } from "@angular/core";
import { PokemonCardComponent } from "../../components/pokemon-card/pokemon-card.component";
import { PokemonDetailComponent } from "../../components/pokemon-detail/pokemon-detail.component";
import PokemonFormsComponent from "../../components/pokemon-forms/pokemon-forms.component";
import { PokemonListComponent } from "../../components/pokemon-list/pokemon-list-component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PokemonRouteModule } from "../../route/pokemon-route.module";

@NgModule({
  declarations: [
    PokemonCardComponent,
    PokemonDetailComponent,
    PokemonFormsComponent,
    PokemonListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PokemonRouteModule
  ],
})
export class PokemonModule { }
