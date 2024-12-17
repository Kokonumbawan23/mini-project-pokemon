import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CvPageComponent } from './cv/cv-page/cv-page.component';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list-component';
import { PokemonDetailComponent } from './components/pokemon-detail/pokemon-detail.component';
import FormSubmissionComponent from './components/form-submission/form-submission.component';
import FormSubmissionEditComponent from './components/form-submission/edit/form-submission-edit/form-submission-edit.component';

const routes: Routes = [
  {
    path: 'pokemon-list',
    pathMatch: 'full',
    component: PokemonListComponent
  },
  {
    path: 'pokemon-detail/:name',
    component: PokemonDetailComponent,
  },
  {
    path: 'form-submission',
    component: FormSubmissionComponent
  },
  {
    path: 'form-submission/:id/edit',
    component: FormSubmissionEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
