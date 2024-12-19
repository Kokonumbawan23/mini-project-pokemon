import { inject, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CvModule } from "./cv/cv.module";
import { TitlecasePipe } from './pipe/titlecase.pipe';
import { HomeLayoutComponent } from './components/pokemon-layout/pokemon-layout.component';
import { AuthComponent } from './components/auth/auth.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import environment from '../environment';
import { Auth, getAuth, provideAuth } from '@angular/fire/auth';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CartComponent } from './components/cart/cart.component';
import { Store, StoreModule } from '@ngrx/store';
import { cartReducer } from './state/cart/cart.reducer';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { RealtimeDatabaseService } from './services/realtime-database.service';
import { PokemonService } from './services/pokemon.service';

@NgModule({
  declarations: [
    AppComponent,
    TitlecasePipe,
    HomeLayoutComponent,
    AuthComponent,
    SidebarComponent,
    CartComponent,
    CheckoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CvModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot({
      cart: cartReducer
    },{
      runtimeChecks:{
        strictStateImmutability: true,
        strictActionImmutability: true,
      }
    }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25
    })
],
  providers: [
    // PokemonService,
    // RealtimeDatabaseService,
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
