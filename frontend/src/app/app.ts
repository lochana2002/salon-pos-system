
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from './services/customer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
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

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          'Could not load customers. Check that the backend is running.';
        console.error(error);
      }
    });
  }

  saveCustomer(): void {
  if (!this.form.fullName?.trim() || !this.form.phone?.trim()) {
    this.errorMessage = 'Please enter the customer name and phone number.';
    return;
  }

  this.saving = true;
  this.errorMessage = '';
  this.successMessage = '';

  const customer: Customer = {
    fullName: this.form.fullName.trim(),
    phone: this.form.phone.trim(),
    email: this.form.email?.trim() || undefined,
    address: this.form.address?.trim() || undefined
  };

  const request = this.editingCustomerId !== null
    ? this.customerService.updateCustomer(this.editingCustomerId, customer)
    : this.customerService.addCustomer(customer);

  request.subscribe({
    next: () => {
      this.saving = false;
      this.successMessage = this.editingCustomerId !== null
        ? 'Customer updated successfully!'
        : 'Customer added successfully!';

      this.clearForm();
      this.loadCustomers();
    },
    error: (error) => {
      this.saving = false;
      this.errorMessage = 'Could not save the customer. Please try again.';
      console.error(error);
    }
  });
}

editCustomer(customer: Customer): void {
  if (customer.id === undefined) {
    return;
  }

  this.editingCustomerId = customer.id;

  this.form = {
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email ?? '',
    address: customer.address ?? ''
  };

  this.errorMessage = '';
  this.successMessage = '';
}

deleteCustomer(customer: Customer): void {
  if (customer.id === undefined) {
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete ${customer.fullName}?`
  );

  if (!confirmed) {
    return;
  }

  this.customerService.deleteCustomer(customer.id).subscribe({
    next: () => {
      this.successMessage = 'Customer deleted successfully!';

      if (this.editingCustomerId === customer.id) {
        this.clearForm();
      }

      this.loadCustomers();
    },
    error: (error) => {
      this.errorMessage = 'Could not delete the customer.';
      console.error(error);
    }
  });
}
  
  clearForm(): void {
    this.form = {
      fullName: '',
      phone: '',
      email: '',
      address: ''
    };

    this.editingCustomerId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

}
