import { Inject, Injectable } from '@angular/core';
import { CanDeactivate, CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  dirty: boolean;
  canDeactivate: () => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(){}
  canDeactivate(component: CanComponentDeactivate): boolean {
   return component.canDeactivate ? component.canDeactivate() : true;
  }
}
