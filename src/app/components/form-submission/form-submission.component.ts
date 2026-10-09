import { Component, OnInit } from "@angular/core";
import { RealtimeDatabaseService } from "../../services/realtime-database.service";
import { PokemonService } from "../../services/pokemon.service";
import { Order, orderCardCount, orderPokemonNames, ordersFromFirebase, quantityPerPokemon } from "../../shared/order";
import { Product, productFromApi } from "../../shared/product";

@Component({
  selector: "app-form-submission",
  templateUrl: "./form-submission.component.html",
  styleUrl: "./form-submission.component.css",
  standalone: false
})
export default class FormSubmissionComponent implements OnInit{

  orders: Order[] = [];
  /** Data kartu per nama Pokémon, untuk thumbnail */
  products: Record<string, Product> = {};
  isLoading = true;
  loadError = '';
  deletingId: string | null = null;

  readonly cardCount = orderCardCount;
  readonly skeletons = Array(3);

  constructor(private dbService: RealtimeDatabaseService, private pokemonService: PokemonService) {}

  async ngOnInit() {
    try {
      this.orders = ordersFromFirebase(await this.dbService.getFormSubmissions());
    } catch {
      this.loadError = 'Orders could not be loaded. Check your connection and refresh the page.';
    } finally {
      this.isLoading = false;
    }
    await this.loadProducts();
  }

  /** Ambil data kartu untuk setiap nama unik (sekali per nama, paralel) */
  private async loadProducts() {
    const names = orderPokemonNames(this.orders);
    const results = await Promise.allSettled(names.map(name => this.pokemonService.getPokemonDetailsByName(name)));
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        this.products[names[i]] = productFromApi(result.value);
      }
    });
  }

  /** Maksimal 3 kartu pertama untuk "kipas" thumbnail */
  previewNames(order: Order): string[] {
    return order.pokemonToBuy.flatMap(line => line.pokemon).slice(0, 3);
  }

  /** Ringkasan isi pesanan, mis. "Pikachu ×2, Eevee and 3 more" */
  summary(order: Order): string {
    const parts = order.pokemonToBuy.flatMap(line => line.pokemon.map(name => {
      const label = name.charAt(0).toUpperCase() + name.slice(1);
      const qty = quantityPerPokemon(line);
      return qty > 1 ? `${label} ×${qty}` : label;
    }));
    const shown = parts.slice(0, 3).join(', ');
    return parts.length > 3 ? `${shown} and ${parts.length - 3} more` : shown;
  }

  async deleteSubmission(order: Order){
    if (!confirm(`Delete the order from ${order.firstName} ${order.lastName}? This can't be undone.`)) {
      return;
    }
    this.deletingId = order.id;
    try{
      await this.dbService.deleteFormSubmission(order.id);
      this.orders = this.orders.filter(o => o.id !== order.id);
    }catch{
      alert('The order could not be deleted. Try again.');
    }finally{
      this.deletingId = null;
    }
  }

  trackById(_: number, order: Order) {
    return order.id;
  }
}
