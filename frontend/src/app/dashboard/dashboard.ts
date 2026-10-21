import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RouterLink, Router,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomerService } from '../services/customer';
import { AppointmentService, Appointment } from '../services/appointment';
import {
  SalonServiceApi,
  SalonService as ApiSalonService
} from '../services/salon-service';
import {
  SalesService,
  TodaySalesSummary
} from '../services/sales.service';

interface DisplayItem {
  id: number;
  name: string;
  price: number;
  duration: string;
  category: string;
  image: string;
}

interface CartItem extends DisplayItem {
  quantity: number;
}

interface DisplayCustomer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  initials: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private customerService = inject(CustomerService);
  private appointmentService = inject(AppointmentService);
  private salonServiceApi = inject(SalonServiceApi);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private routerSubscription?: Subscription;
  private clockInterval?: ReturnType<typeof setInterval>;
private salesService = inject(SalesService);
  activeTab: 'services' | 'products' = 'services';
  selectedCategory = 'All';
  searchQuery = '';
  customerSearch = '';

todaysAppointmentsCount = 0;
todaysAppointments: Appointment[] = [];
  isLoadingServices = false;

  todaySalesRevenue = 0;
todaySalesCount = 0;
isLoadingSales = false;
salesError = false;

  // Live date and time
  currentDateTime = new Date();

  categories = [
    'All',
    'Hair',
    'Hair Colouring',
    'Facial',
    'Treatment',
    'Nails',
    'Makeup',
    'Other'
  ];

  servicesList: DisplayItem[] = [];
  cart: CartItem[] = [];
  customers: DisplayCustomer[] = [];

  ngOnInit(): void {
  this.loadAllData();

  // Update the clock every second
  this.clockInterval = setInterval(() => {
    this.currentDateTime = new Date();
    this.cdr.detectChanges();
  }, 1000);
}

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    this.routerSubscription?.unsubscribe();
  }

  loadAllData(): void {
    this.loadCustomers();
    this.loadAppointmentsCount();
    this.loadSalonServices();
     this.loadTodaySales();
  }
  loadTodaySales(): void {
  this.isLoadingSales = true;
  this.salesError = false;

  this.salesService.getTodaySales().subscribe({
    next: (data: TodaySalesSummary) => {
      this.todaySalesRevenue = Number(data.totalRevenue) || 0;
      this.todaySalesCount = Number(data.salesCount) || 0;
      this.isLoadingSales = false;
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error("Failed to load today's sales:", error);
      this.salesError = true;
      this.isLoadingSales = false;
      this.cdr.markForCheck();
    }
  });
}

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: data => {
        this.customers = data.map(c => ({
          id: c.id,
          name: c.fullName,
          phone: c.phone,
          email: c.email,
          initials: this.getInitials(c.fullName)
        }));

        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Failed to load customers:', err);
      }
    });
  }

 
loadAppointmentsCount(): void {
  this.appointmentService.getAppointments().subscribe({
    next: (appointments: Appointment[]) => {
      const today = new Date();

      this.todaysAppointments = appointments
        .filter(appointment => {
          if (!appointment.startTime) {
            return false;
          }

          const appointmentDate = new Date(appointment.startTime);

          return (
            !Number.isNaN(appointmentDate.getTime()) &&
            appointmentDate.getFullYear() === today.getFullYear() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getDate() === today.getDate()
          );
        })
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() -
            new Date(b.startTime).getTime()
        );

      this.todaysAppointmentsCount = this.todaysAppointments.length;

      this.cdr.markForCheck();
    },
    error: err => {
      console.error('Failed to load appointments:', err);
      this.todaysAppointments = [];
      this.todaysAppointmentsCount = 0;
      this.cdr.markForCheck();
    }
  });
}


  loadSalonServices(): void {
    this.isLoadingServices = true;

    this.salonServiceApi.getServices().subscribe({
      next: (data: ApiSalonService[]) => {
        this.servicesList = data
          .filter(s => s.isActive !== false)
          .map(s => ({
            id: s.id!,
            name: s.name,
            price: s.price,
            duration: `${s.durationMinutes} min`,
            category: s.category || 'Other',
            image: this.getServiceImage(
              s.name,
              s.category || 'Other'
            )
          }));

        this.isLoadingServices = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Failed to load salon services:', err);
        this.isLoadingServices = false;
        this.cdr.markForCheck();
      }
    });
  }

  getServiceImage(name: string, category: string): string {
    const serviceImages: { [key: string]: string } = {
      'haircut':
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop',
      'hair cut':
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop',
      'hair styling':
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop',
      'hair coloring':
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      'hair colour':
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      'facial':
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop',
      'manicure':
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop',
      'pedicure':
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop',
      'nail art':
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop',
      'bridal makeup':
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&auto=format&fit=crop',
      'makeup':
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      'massage':
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop'
    };

    const key = (name || '').trim().toLowerCase();

    if (serviceImages[key]) {
      return serviceImages[key];
    }

    const matchedKey = Object.keys(serviceImages).find(
      serviceName => key.includes(serviceName)
    );

    if (matchedKey) {
      return serviceImages[matchedKey];
    }

    return this.getCategoryImage(category);
  }

  getCategoryImage(category: string): string {
    const images: { [key: string]: string } = {
      hair:
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop',
      'hair colouring':
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      facial:
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop',
      treatment:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop',
      nails:
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop',
      makeup:
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      other:
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop'
    };

    const key = (category || '').trim().toLowerCase();

    return images[key] || images['other'];
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) {
      return 'CS';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.trim().substring(0, 2).toUpperCase();
  }

  get filteredCustomers(): DisplayCustomer[] {
    const search = this.customerSearch.toLowerCase().trim();

    return this.customers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.phone.toLowerCase().includes(search)
    );
  }

  get filteredServices(): DisplayItem[] {
    const search = this.searchQuery.toLowerCase().trim();

    return this.servicesList.filter(service => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        service.category.toLowerCase() ===
          this.selectedCategory.toLowerCase();

      const matchesSearch =
        service.name.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }

  get subtotal(): number {
    return this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  addToCart(service: DisplayItem): void {
    const existing = this.cart.find(item => item.id === service.id);

    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        ...service,
        quantity: 1
      });
    }
  }

  updateQuantity(item: CartItem, change: number): void {
    item.quantity += change;

    if (item.quantity <= 0) {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(i => i.id !== item.id);
  }

  clearCart(): void {
    this.cart = [];
  }
}