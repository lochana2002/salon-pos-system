import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Item {
  id: number;
  name: string;
  price: number;
  duration: string;
  durationMinutes?: number;
  category: string;
  image: string;
}

interface CartItem extends Item {
  quantity: number;
  service?: Item;
}

interface Customer {
  name: string;
  phone: string;
  initials: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html',
  styleUrl: './pos.css'
})
export class PosComponent {
  activeTab: 'services' | 'products' = 'services';
  selectedCategory = 'All';
  searchQuery = '';
  searchText = '';
  customerSearch = '';
  customerName = '';
  paymentMethod = 'Cash';
  errorMessage = '';
  isLoading = false;
  showReceipt = false;
  receiptNumber = '';
  completedItems: CartItem[] = [];
  completedTotal = 0;

  categories = ['All', 'Hair', 'Hair Colouring', 'Facial', 'Treatment', 'Nails', 'Makeup', 'Other'];

  servicesList: Item[] = [
    { id: 1, name: 'Haircut', price: 1500, duration: '30 min', durationMinutes: 30, category: 'Hair', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300' },
    { id: 2, name: 'Hair Colouring', price: 3500, duration: '90 min', durationMinutes: 90, category: 'Hair Colouring', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=300' },
    { id: 3, name: 'Facial', price: 2500, duration: '60 min', durationMinutes: 60, category: 'Facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300' },
    { id: 4, name: 'Manicure', price: 1200, duration: '45 min', durationMinutes: 45, category: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=300' },
    { id: 5, name: 'Pedicure', price: 1500, duration: '60 min', durationMinutes: 60, category: 'Nails', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=300' },
    { id: 6, name: 'Massage', price: 2000, duration: '60 min', durationMinutes: 60, category: 'Treatment', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=300' },
    { id: 7, name: 'Makeup', price: 2500, duration: '60 min', durationMinutes: 60, category: 'Makeup', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=300' },
    { id: 8, name: 'Hair Treatment', price: 2000, duration: '45 min', durationMinutes: 45, category: 'Hair', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300' },
  ];

  cart: CartItem[] = [
    { id: 1, name: 'Haircut', price: 1500, duration: '30 min', durationMinutes: 30, category: 'Hair', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300', quantity: 1, service: { id: 1, name: 'Haircut', price: 1500, duration: '30 min', category: 'Hair', image: '' } },
    { id: 2, name: 'Hair Colouring', price: 3500, duration: '90 min', durationMinutes: 90, category: 'Hair Colouring', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=300', quantity: 1, service: { id: 2, name: 'Hair Colouring', price: 3500, duration: '90 min', category: 'Hair Colouring', image: '' } },
    { id: 4, name: 'Manicure', price: 1200, duration: '45 min', durationMinutes: 45, category: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=300', quantity: 1, service: { id: 4, name: 'Manicure', price: 1200, duration: '45 min', category: 'Nails', image: '' } }
  ];

  customers: Customer[] = [
    { name: 'Sarah Collins', phone: '077 123 4567', initials: 'SC' },
    { name: 'Kavindu Lakshan', phone: '077 987 6543', initials: 'KL' },
    { name: 'Piumi Wathsala', phone: '076 555 4433', initials: 'PW' },
    { name: 'Dinusha Nirmana', phone: '078 222 1111', initials: 'DN' }
  ];

  get filteredServices() {
    const query = this.searchText || this.searchQuery;
    return this.servicesList.filter(service => {
      const matchesCategory = this.selectedCategory === 'All' || service.category === this.selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  get subtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  addToCart(service: Item) {
    const existing = this.cart.find(item => item.id === service.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ 
        ...service, 
        quantity: 1,
        service: service
      });
    }
  }

  updateQuantity(item: CartItem, change: number) {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeFromCart(item);
    }
  }

  changeQuantity(item: CartItem, change: number) {
    this.updateQuantity(item, change);
  }

  removeItem(item: CartItem) {
    this.removeFromCart(item);
  }

  removeFromCart(item: CartItem) {
    this.cart = this.cart.filter(i => i.id !== item.id);
  }

  clearCart() {
    this.cart = [];
  }

  completePayment() {
    if (this.cart.length === 0) {
      this.errorMessage = 'Cart is empty!';
      return;
    }
    this.errorMessage = '';
    this.completedItems = [...this.cart];
    this.completedTotal = this.subtotal;
    this.receiptNumber = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    this.showReceipt = true;
  }

  printReceipt() {
    window.print();
  }

  newSale() {
    this.cart = [];
    this.showReceipt = false;
    this.customerName = '';
  }
}