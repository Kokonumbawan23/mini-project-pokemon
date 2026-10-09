import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeLayoutComponent } from './components/pokemon-layout/pokemon-layout.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Buka "/" → langsung ke Pokédex
      { path: '', pathMatch: 'full', redirectTo: 'pokemon' },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
      },
      {
        path: 'pokemon',
        loadChildren: () =>
          import('./module/pokemon/pokemon.module').then(
            (m) => m.PokemonModule,
          ),
      },
      {
        path: 'form-submission',
        loadChildren: () =>
          import('./module/submission/submission.module').then(
            (m) => m.SubmissionModule,
          ),
      },
    ],
  },
  // URL yang tidak dikenal → kembali ke Pokédex
  { path: '**', redirectTo: 'pokemon' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
