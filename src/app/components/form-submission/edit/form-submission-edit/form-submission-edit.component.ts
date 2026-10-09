import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { RealtimeDatabaseService } from './../../../../services/realtime-database.service';
import { PokemonService } from './../../../../services/pokemon.service';
import { CanComponentDeactivate } from '../../../../guards/form.guard';
import { Order, orderCardCount, quantityPerPokemon } from '../../../../shared/order';
import { Product, productFromApi } from '../../../../shared/product';

/** Satu baris kartu di ringkasan pesanan */
interface OrderRow {
  name: string;
  quantity: number;
  unitPrice?: number;
  product?: Product;
}

@Component({
  selector: 'app-form-submission-edit',
  templateUrl: './form-submission-edit.component.html',
  styleUrl: './form-submission-edit.component.css',
  standalone: false
})
export default class FormSubmissionEditComponent implements OnInit, CanComponentDeactivate{
  orderId = '';
  order: Order | null = null;
  rows: OrderRow[] = [];
  isLoading = true;
  loadError = '';
  isSaving = false;
  saveState: 'idle' | 'saved' | 'error' = 'idle';

  form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phoneCountryCode: new FormControl('+62', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]{9,13}$/)] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
  });

  constructor(
    private pokemonService: PokemonService,
    private dbService: RealtimeDatabaseService,
    private route: ActivatedRoute
  ) {}

  /** Dipakai FormGuard: true kalau ada perubahan yang belum disimpan */
  get dirty(): boolean {
    return this.form.dirty;
  }

  get cardCount(): number {
    return this.order ? orderCardCount(this.order) : 0;
  }

  async ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
    // Variabel lokal: TypeScript bisa memastikan tipenya bukan null (beda dengan this.order)
    let order: Order;
    try {
      const data = await this.dbService.getFormSubmission(this.orderId);
      if (!data) {
        this.loadError = 'This order no longer exists. It may have been deleted.';
        return;
      }
      order = { ...data, id: this.orderId, pokemonToBuy: data.pokemonToBuy ?? [] };
      this.order = order;
      // patchValue tidak menandai form sebagai dirty, jadi guard tidak langsung aktif
      this.form.patchValue(data);
    } catch {
      this.loadError = 'This order could not be loaded. Check your connection and refresh the page.';
      return;
    } finally {
      this.isLoading = false;
    }

    this.rows = order.pokemonToBuy.flatMap(line =>
      line.pokemon.map(name => ({ name, quantity: quantityPerPokemon(line), unitPrice: line.unitPrice }))
    );
    await this.loadProducts();
  }

  private async loadProducts() {
    const results = await Promise.allSettled(this.rows.map(row => this.pokemonService.getPokemonDetailsByName(row.name)));
    this.rows = this.rows.map((row, i) => {
      const result = results[i];
      return result.status === 'fulfilled' ? { ...row, product: productFromApi(result.value) } : row;
    });
  }

  showError(field: 'firstName' | 'lastName' | 'email' | 'phone' | 'address'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveState = 'idle';
    try {
      // PATCH: hanya data kontak yang dikirim, daftar kartu & total tidak tersentuh
      await this.dbService.updateFormSubmission(this.orderId, this.form.getRawValue());
      this.form.markAsPristine();
      this.saveState = 'saved';
    } catch {
      this.saveState = 'error';
    } finally {
      this.isSaving = false;
    }
  }

  canDeactivate(): boolean {
    return !this.dirty || confirm('You have unsaved changes. Leave this page anyway?');
  }
}
