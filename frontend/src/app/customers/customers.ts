
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer, CustomerService } from '../services/customer';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {

  private customerService = inject(CustomerService);

  customers: Customer[] = [];

  editingCustomerId: number | null = null;

  form: Customer = {
    fullName: '',
    phone: '',
    email: '',
    address: ''
  };

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadCustomers();
  }

  // Load all customers
  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.errorMessage = 'Unable to load customers. Please check the API.';
        this.loading = false;
      }
    });
  }

  // Add or update a customer
  saveCustomer(): void {
    if (!this.form.fullName.trim() || !this.form.phone.trim()) {
      this.errorMessage = 'Customer name and phone number are required.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const customer: Customer = {
      ...this.form,
      fullName: this.form.fullName.trim(),
      phone: this.form.phone.trim()
    };

    if (this.editingCustomerId !== null) {
      this.customerService
        .updateCustomer(this.editingCustomerId, customer)
        .subscribe({
          next: () => {
            this.successMessage = 'Customer updated successfully.';
            this.clearForm();
            this.saving = false;
            this.loadCustomers();
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            this.errorMessage = 'Failed to update customer.';
            this.saving = false;
          }
        });
    } else {
      this.customerService.addCustomer(customer).subscribe({
        next: () => {
          this.successMessage = 'Customer added successfully.';
          this.clearForm();
          this.saving = false;
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Error adding customer:', error);
          this.errorMessage = 'Failed to add customer.';
          this.saving = false;
        }
      });
    }
  }

  // Load customer details into the form
  editCustomer(customer: Customer): void {
    this.form = {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email ?? '',
      address: customer.address ?? ''
    };

    this.editingCustomerId = customer.id ?? null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Delete a customer
  deleteCustomer(id: number | undefined): void {
    if (id === undefined) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.successMessage = 'Customer deleted successfully.';
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.errorMessage = 'Failed to delete customer.';
      }
    });
  }

  // Clear the form
  clearForm(): void {
    this.form = {
      fullName: '',
      phone: '',
      email: '',
      address: ''
    };

    this.editingCustomerId = null;
    this.errorMessage = '';
  }
}
