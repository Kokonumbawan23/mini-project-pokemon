import { NgModule } from "@angular/core";
import { TcgCardComponent } from "../../components/tcg-card/tcg-card.component";
import { PokemonDetailComponent } from "../../components/pokemon-detail/pokemon-detail.component";
import PokemonFormsComponent from "../../components/pokemon-forms/pokemon-forms.component";
import { PokemonListComponent } from "../../components/pokemon-list/pokemon-list-component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PokemonRouteModule } from "../../route/pokemon-route.module";
import { RupiahPipe } from "../../shared/rupiah.pipe";

@NgModule({
  declarations: [
    PokemonDetailComponent,
    PokemonFormsComponent,
    PokemonListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PokemonRouteModule,
    // Standalone component & pipe di-import, bukan dideklarasikan
    TcgCardComponent,
    RupiahPipe,
  ],
})
export class PokemonModule { }
