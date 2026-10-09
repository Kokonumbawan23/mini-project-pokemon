import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

/**
 * Mengingat query params terakhir di binder (filter, sort, halaman),
 * supaya link "Back to binder" di halaman detail kembali ke posisi yang sama.
 */
@Injectable({ providedIn: 'root' })
export class BinderStateService {
  lastQueryParams: Params = {};
}
