import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CvModule } from "./cv/cv.module";
import { PokemonDetailComponent } from './components/pokemon-detail/pokemon-detail.component';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list-component';
import { TitlecasePipe } from './pipe/titlecase.pipe';
import { PokemonCardComponent } from './components/pokemon-card/pokemon-card.component';
import PokemonFormsComponent from './components/pokemon-forms/pokemon-forms.component';
import FormSubmissionComponent from './components/form-submission/form-submission.component';
import FormSubmissionEditComponent  from './components/form-submission/edit/form-submission-edit/form-submission-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    PokemonListComponent,
    PokemonDetailComponent,
    TitlecasePipe,
    PokemonCardComponent,
    PokemonFormsComponent,
    FormSubmissionComponent,
    FormSubmissionEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CvModule,
    FormsModule,
    ReactiveFormsModule
],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
