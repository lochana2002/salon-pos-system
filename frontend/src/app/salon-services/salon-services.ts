
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SalonService,
  SalonServiceApi
} from '../services/salon-service';

@Component({
  selector: 'app-salon-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salon-services.html',
  styleUrl: './salon-services.css'
})
export class SalonServices implements OnInit {
  private serviceApi = inject(SalonServiceApi);

  services: SalonService[] = [];
  service: SalonService = this.emptyService();

  editingId: number | null = null;
  message = '';
  errorMessage = '';
  isLoading = false;

  // Controls whether the add/edit form is visible
  showForm = false;

  ngOnInit(): void {
    this.loadServices();
  }

  emptyService(): SalonService {
    return {
      name: '',
      category: '',
      description: '',
      price: 0,
      durationMinutes: 30,
      isActive: true
    };
  }

  loadServices(): void {
    this.isLoading = true;

    this.serviceApi.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          'Unable to load services. Check whether the backend is running.';
        this.isLoading = false;
      }
    });
  }

  startAddService(): void {
    this.service = this.emptyService();
    this.editingId = null;
    this.showForm = true;
    this.message = '';
    this.errorMessage = '';
  }

  saveService(): void {
    this.message = '';
    this.errorMessage = '';

    if (
      !this.service.name.trim() ||
      !this.service.category.trim() ||
      this.service.price <= 0 ||
      this.service.durationMinutes < 1
    ) {
      this.errorMessage =
        'Enter a name, category, valid price and duration.';
      return;
    }

    const payload: SalonService = {
      ...this.service,
      name: this.service.name.trim(),
      category: this.service.category.trim()
    };

    if (this.editingId !== null) {
      this.serviceApi.updateService(this.editingId, payload).subscribe({
        next: () => {
          this.message = 'Service updated successfully.';
          this.resetForm();
          this.loadServices();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'Unable to update the service.';
        }
      });
    } else {
      this.serviceApi.addService(payload).subscribe({
        next: () => {
          this.message = 'Service added successfully.';
          this.resetForm();
          this.loadServices();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'Unable to add the service.';
        }
      });
    }
  }

  editService(item: SalonService): void {
    this.service = { ...item };
    this.editingId = item.id!;
    this.showForm = true;
    this.message = '';
    this.errorMessage = '';
  }

  deleteService(id: number): void {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    this.serviceApi.deleteService(id).subscribe({
      next: () => {
        this.message = 'Service deleted successfully.';
        this.loadServices();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Unable to delete the service.';
      }
    });
  }

  getCategoryImage(category: string): string {
    const images: { [key: string]: string } = {
      hair: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop',
      'hair colouring': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop',
      treatment: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop',
      nails: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop',
      makeup: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop',
      other: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop'
    };

    const key = (category || '').trim().toLowerCase();
    return images[key] || images['other'];
  }

  resetForm(): void {
    this.service = this.emptyService();
    this.editingId = null;
    this.showForm = false;
  }

  cancelEdit(): void {
    this.resetForm();
    this.message = '';
    this.errorMessage = '';
  }
}
