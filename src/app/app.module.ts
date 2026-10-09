import { NgModule, isDevMode } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firebaseAuthInterceptor } from './interceptors/firebase-auth.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeLayoutComponent } from './components/pokemon-layout/pokemon-layout.component';
import { AuthComponent } from './components/auth/auth.component';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import environment from '../environment';
import { browserLocalPersistence, indexedDBLocalPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CartComponent } from './components/cart/cart.component';
import { StoreModule } from '@ngrx/store';
import { cartReducer } from './state/cart/cart.reducer';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { TcgCardComponent } from './components/tcg-card/tcg-card.component';
import { RupiahPipe } from './shared/rupiah.pipe';
import { ToastContainerComponent } from './shared/toast/toast-container.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeLayoutComponent,
    AuthComponent,
    NavbarComponent,
    CartComponent,
    CheckoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TcgCardComponent,
    RupiahPipe,
    ToastContainerComponent,
    StoreModule.forRoot(
      {
        cart: cartReducer,
      },
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
        },
      },
    ),
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // initializeAuth (bukan getAuth) supaya fitur login popup/redirect yang tidak dipakai
    // tidak ikut ter-bundle. Sesi disimpan di IndexedDB, cadangannya localStorage.
    provideAuth(() => initializeAuth(getApp(), {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    })),
    // Redux DevTools hanya saat development; di production tidak ikut ter-bundle
    isDevMode() ? provideStoreDevtools({ maxAge: 25 }) : [],
    provideHttpClient(withInterceptors([firebaseAuthInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
