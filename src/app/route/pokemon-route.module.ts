import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PokemonListComponent } from "../components/pokemon-list/pokemon-list-component";
import { PokemonDetailComponent } from "../components/pokemon-detail/pokemon-detail.component";
import { FormGuard } from "../guards/form.guard";


const routes: Routes = [
      {
        path: '',
        component: PokemonListComponent
      },
      {
        path: 'detail/:name',
        component: PokemonDetailComponent,
        canDeactivate: [FormGuard]
      },
    ];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PokemonRouteModule{ }
