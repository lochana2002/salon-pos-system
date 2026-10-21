
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  SalonServiceApi,
  SalonService
} from '../services/salon-service';

import {
  ProductService,
  Product
} from '../services/product.service';

import { CustomerService } from '../services/customer';

import {
  SalesService,
  PaymentMethod,
  CreateSaleItemRequest,
  CreateSaleRequest,
  SaleResponse
} from '../services/sales.service';

type ItemType = 'service' | 'product';

interface PosItem {
  id: number;
  name: string;
  category: string;
  price: number;
  type: ItemType;
  icon: string;
  imageUrl: string;
  stock?: number;
  durationMinutes?: number;
}

interface CartItem extends PosItem {
  quantity: number;
}

interface PosCustomer {
  id?: number;
  fullName: string;
  phone: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html',
  styleUrl: './pos.css'
})
export class PosComponent implements OnInit {
  private salonServiceApi = inject(SalonServiceApi);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private salesService = inject(SalesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Catalog
  activeTab: ItemType = 'service';

  services: PosItem[] = [];
  products: PosItem[] = [];
  customers: PosCustomer[] = [];
  cart: CartItem[] = [];

  searchText = '';
  selectedCategory = 'All';
  selectedCustomerId = '';
  customerSearch = '';

  loading = false;
  loadingCustomers = false;

  errorMessage = '';
  noticeMessage = '';

  // Checkout
  showCheckout = false;
  paymentMethod: PaymentMethod = 'Cash';
  amountReceived: number | null = null;
  submittingSale = false;

  // Receipt
  showReceipt = false;
  lastSale: SaleResponse | null = null;
  lastSaleCustomerName = '';

  ngOnInit(): void {
    this.loadServices();
    this.loadProducts();
    this.loadCustomers();
  }

  // Load salon services
  loadServices(): void {
    this.loading = true;

    this.salonServiceApi.getServices().subscribe({
      next: (data: SalonService[]) => {
        this.services = data
          .filter(service => service.isActive !== false)
          .map(service => ({
            id: service.id!,
            name: service.name,
            category: service.category || 'Other',
            price: Number(service.price),
            type: 'service' as ItemType,
            icon: this.getServiceIcon(service.category),
            imageUrl: this.getServiceImage(
              service.category,
              service.name
            ),
            durationMinutes: service.durationMinutes
          }));

        this.loading = false;
      },
      error: error => {
        console.error('Failed to load services:', error);

        this.errorMessage =
          'Could not load salon services. Check that the API is running.';

        this.loading = false;
      }
    });
  }

  // Load products
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category || 'Other',
          price: Number(product.price),
          type: 'product' as ItemType,
          icon: product.icon || '🧴',
          imageUrl: this.getProductImage(
            product.category,
            product.name
          ),
          stock: Number(product.stock)
        }));
      },
      error: error => {
        console.error('Failed to load products:', error);

        this.errorMessage =
          'Could not load products. Check that the API is running.';
      }
    });
  }

  // Load customers
  loadCustomers(): void {
    this.loadingCustomers = true;

    this.customerService.getCustomers().subscribe({
      next: (data: any[]) => {
        this.customers = data.map(customer => ({
          id: customer.id,
          fullName: customer.fullName,
          phone: customer.phone
        }));

        this.loadingCustomers = false;
      },
      error: error => {
        console.error('Failed to load customers:', error);
        this.loadingCustomers = false;
      }
    });
  }

  // Service images
  getServiceImage(category: string, name: string): string {
    const value = `${category || ''} ${name || ''}`.toLowerCase();

    if (value.includes('hair') || value.includes('cut')) {
      return 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop';
    }

    if (value.includes('facial') || value.includes('skin')) {
      return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop';
    }

    if (
      value.includes('nail') ||
      value.includes('manicure') ||
      value.includes('pedicure')
    ) {
      return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop';
    }

    if (value.includes('makeup')) {
      return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop';
    }

    if (
      value.includes('massage') ||
      value.includes('treatment') ||
      value.includes('spa')
    ) {
      return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop';
    }

    if (value.includes('lash') || value.includes('eyebrow')) {
      return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop';
    }

    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop';
  }

  // Product images
  getProductImage(category: string, name: string): string {
    const value = `${category || ''} ${name || ''}`.toLowerCase();

    if (value.includes('shampoo')) {
      return 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&auto=format&fit=crop';
    }

    if (value.includes('conditioner') || value.includes('serum')) {
      return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop';
    }

    if (value.includes('nail') || value.includes('polish')) {
      return 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop';
    }

    if (
      value.includes('makeup') ||
      value.includes('lipstick') ||
      value.includes('cosmetic')
    ) {
      return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop';
    }

    if (
      value.includes('cream') ||
      value.includes('lotion') ||
      value.includes('moistur')
    ) {
      return 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&auto=format&fit=crop';
    }

    return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop';
  }

  getServiceIcon(category: string): string {
    const value = (category || '').toLowerCase();

    if (value.includes('hair')) return '💇';
    if (value.includes('facial')) return '🧖';
    if (value.includes('nail')) return '💅';
    if (value.includes('makeup')) return '💄';

    if (
      value.includes('massage') ||
      value.includes('treatment')
    ) {
      return '🌿';
    }

    return '✨';
  }

  // Current catalog
  get currentItems(): PosItem[] {
    return this.activeTab === 'service'
      ? this.services
      : this.products;
  }

  // Available categories
  get categories(): string[] {
    return [
      'All',
      ...new Set(
        this.currentItems
          .map(item => item.category)
          .filter(category => !!category)
      )
    ];
  }

  // Search and filter catalog
  get filteredItems(): PosItem[] {
    const search = this.searchText.trim().toLowerCase();

    return this.currentItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      const matchesCategory =
        this.selectedCategory === 'All' ||
        item.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  // Cart subtotal
  get subtotal(): number {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  // Total quantity in cart
  get totalItems(): number {
    return this.cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  // Selected customer
  get selectedCustomer(): PosCustomer | undefined {
    return this.customers.find(
      customer => String(customer.id) === this.selectedCustomerId
    );
  }

  get checkoutCustomerName(): string {
    if (
      this.selectedCustomerId === '' ||
      this.selectedCustomerId == null
    ) {
      return 'Walk-in Customer';
    }

    return this.selectedCustomer?.fullName ?? 'Selected Customer';
  }

  // Calculate change due
  get changeDue(): number {
    if (this.amountReceived == null) {
      return 0;
    }

    return Math.max(0, this.amountReceived - this.subtotal);
  }

  // Switch catalog tab
  changeTab(tab: ItemType): void {
    this.activeTab = tab;
    this.selectedCategory = 'All';
    this.searchText = '';
    this.noticeMessage = '';
  }

  // Add item to cart
  addToCart(item: PosItem): void {
    this.noticeMessage = '';
    this.errorMessage = '';

    const existing = this.cart.find(
      cartItem =>
        cartItem.type === item.type &&
        cartItem.id === item.id
    );

    if (
      item.type === 'product' &&
      (item.stock ?? 0) <= (existing?.quantity ?? 0)
    ) {
      this.noticeMessage =
        `Not enough stock available for ${item.name}.`;
      return;
    }

    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  // Change quantity
  changeQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(item);
      return;
    }

    if (
      item.type === 'product' &&
      newQuantity > (item.stock ?? 0)
    ) {
      this.noticeMessage =
        `Only ${item.stock ?? 0} unit(s) of ${item.name} are available.`;
      return;
    }

    item.quantity = newQuantity;
    this.noticeMessage = '';
  }

  // Remove item from cart
  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(
      cartItem =>
        !(cartItem.id === item.id && cartItem.type === item.type)
    );

    this.noticeMessage = '';
  }

  // Clear cart
  clearCart(): void {
    this.cart = [];
    this.noticeMessage = '';
    this.errorMessage = '';
  }

  // Open checkout
  checkout(): void {
    if (this.cart.length === 0) {
      this.noticeMessage = 'Please add an item before checkout.';
      return;
    }

    this.errorMessage = '';
    this.noticeMessage = '';
    this.showReceipt = false;
    this.paymentMethod = 'Cash';
    this.amountReceived = null;
    this.showCheckout = true;
  }

  // Save sale and immediately display receipt
  confirmCheckout(): void {
    if (this.submittingSale) {
      return;
    }

    if (this.cart.length === 0) {
      this.errorMessage = 'Your order is empty.';
      return;
    }

    this.errorMessage = '';

    const total = this.subtotal;

    if (
      this.paymentMethod === 'Cash' &&
      (
        this.amountReceived == null ||
        !Number.isFinite(this.amountReceived) ||
        this.amountReceived < total
      )
    ) {
      this.errorMessage =
        'Please enter enough cash to cover the total.';
      return;
    }

    const items: CreateSaleItemRequest[] = this.cart.map(item => ({
      itemId: item.id,
      itemType: item.type,
      quantity: item.quantity
    }));

    const customerId =
      this.selectedCustomerId === ''
        ? null
        : Number(this.selectedCustomerId);

    if (
      customerId !== null &&
      (!Number.isInteger(customerId) || customerId <= 0)
    ) {
      this.errorMessage = 'Please select a valid customer.';
      return;
    }

    const customerName =
      this.selectedCustomer?.fullName ?? 'Walk-in Customer';

    const request: CreateSaleRequest = {
      customerId,
      paymentMethod: this.paymentMethod,
      ...(this.paymentMethod === 'Cash'
        ? { amountReceived: this.amountReceived! }
        : {}),
      items
    };

    this.submittingSale = true;

    this.salesService.createSale(request)
      .pipe(
        finalize(() => {
          this.submittingSale = false;
        })
      )
      .subscribe({
        next: (response: SaleResponse) => {
          console.log('Sale response received:', response);

          // Keep the completed sale for the receipt.
          this.lastSale = response;
          this.lastSaleCustomerName = customerName;

          // Close checkout and display the receipt.
          this.showCheckout = false;
          this.showReceipt = true;

          // Clear the cart only after the sale is saved.
          this.cart = [];
          this.amountReceived = null;
          this.selectedCustomerId = '';
          this.customerSearch = '';
          this.searchText = '';
          this.selectedCategory = 'All';
          this.activeTab = 'service';

          this.errorMessage = '';
          this.noticeMessage =
            `Sale #${response.saleId} saved successfully.`;

          // Apply the state changes immediately.
          this.cdr.detectChanges();

          console.log('Receipt state:', {
            showReceipt: this.showReceipt,
            showCheckout: this.showCheckout,
            lastSale: this.lastSale
          });

          // Refresh product stock after saving the sale.
          this.loadProducts();
        },

        error: error => {
          console.error('Sale request failed:', error);

          this.errorMessage =
            error.error?.message ??
            'Could not save the sale. Please check the API and try again.';
        }
      });
  }

  // Print receipt
  printReceipt(): void {
    if (!this.lastSale) {
      return;
    }

    window.print();
  }

  // Start a new sale
  startNewSale(): void {
    this.cart = [];

    this.selectedCustomerId = '';
    this.customerSearch = '';

    this.paymentMethod = 'Cash';
    this.amountReceived = null;

    this.searchText = '';
    this.selectedCategory = 'All';
    this.activeTab = 'service';

    this.showCheckout = false;
    this.showReceipt = false;
    this.lastSale = null;
    this.lastSaleCustomerName = '';

    this.errorMessage = '';
    this.noticeMessage = '';

    this.cdr.detectChanges();
  }

  // Navigate to sales history
  goToSalesHistory(): void {
    this.router.navigate(['/sales-history']);
  }
}
