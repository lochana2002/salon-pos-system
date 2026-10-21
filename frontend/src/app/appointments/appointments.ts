import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer, CustomerService } from '../services/customer';
import { Employee, EmployeeService } from '../services/employee';
import {
  SalonService as SalonServiceItem,
  SalonServiceApi
} from '../services/salon-service';
import {
  Appointment,
  AppointmentService
} from '../services/appointment';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class Appointments implements OnInit {
  private appointmentApi = inject(AppointmentService);
  private customerApi = inject(CustomerService);
  private employeeApi = inject(EmployeeService);
  private salonServiceApi = inject(SalonServiceApi);

  appointments: Appointment[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  services: SalonServiceItem[] = [];

  booking: Appointment = this.emptyBooking();

  isLoading = false;
  isSaving = false;
  message = '';
  errorMessage = '';
  showForm = false;

  startAddAppointment(): void {
  this.booking = this.emptyBooking();
  this.message = '';
  this.errorMessage = '';
  this.showForm = true;
}

cancelForm(): void {
  this.booking = this.emptyBooking();
  this.message = '';
  this.errorMessage = '';
  this.showForm = false;
}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadCustomers();
    this.loadEmployees();
    this.loadServices();
  }

  emptyBooking(): Appointment {
    return {
      customerId: 0,
      employeeId: 0,
      salonServiceId: 0,
      startTime: '',
      notes: ''
    };
  }

  loadAppointments(): void {
    this.isLoading = true;

    this.appointmentApi.getAppointments().subscribe({
      next: data => {
        this.appointments = data;
        this.isLoading = false;
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Unable to load appointments.';
        this.isLoading = false;
      }
    });
  }

  loadCustomers(): void {
    this.customerApi.getCustomers().subscribe({
      next: data => this.customers = data,
      error: error => console.error('Customers:', error)
    });
  }

  loadEmployees(): void {
    this.employeeApi.getEmployees().subscribe({
      next: data => this.employees = data,
      error: error => console.error('Employees:', error)
    });
  }

  loadServices(): void {
    this.salonServiceApi.getServices().subscribe({
      next: data => this.services = data.filter(s => s.isActive !== false),
      error: error => console.error('Services:', error)
    });
  }

  get selectedService(): SalonServiceItem | undefined {
    return this.services.find(
      service => service.id === Number(this.booking.salonServiceId)
    );
  }

  bookAppointment(): void {
  this.message = '';
  this.errorMessage = '';

  if (
    !this.booking.customerId ||
    !this.booking.employeeId ||
    !this.booking.salonServiceId ||
    !this.booking.startTime
  ) {
    this.errorMessage =
      'Please select a customer, employee, service, date and time.';
    return;
  }

  const start = new Date(this.booking.startTime);

  if (start <= new Date()) {
    this.errorMessage = 'Please select a future appointment time.';
    return;
  }

  const payload: Appointment = {
    customerId: Number(this.booking.customerId),
    employeeId: Number(this.booking.employeeId),
    salonServiceId: Number(this.booking.salonServiceId),
    startTime: start.toISOString(),
    notes: this.booking.notes?.trim() || ''
  };

  this.isSaving = true;

  this.appointmentApi.addAppointment(payload).subscribe({
    next: () => {
      this.booking = this.emptyBooking();
      this.message = 'Appointment booked successfully!';

      // Load the updated appointments list
      this.appointmentApi.getAppointments().subscribe({
        next: data => {
          this.appointments = data;
          this.isSaving = false;

          // Return to All Appointments
          this.showForm = false;
        },
        error: error => {
          console.error(error);
          this.errorMessage =
            'Appointment booked, but unable to refresh the appointments list.';
          this.isSaving = false;
          this.showForm = false;
        }
      });
    },
    error: error => {
      console.error(error);

      this.errorMessage =
        error.status === 409
          ? (error.error?.message ||
             'Employee already has a booking at this time.')
          : (error.error?.message ||
             'Could not book appointment.');

      this.isSaving = false;
    }
  });
}

  changeStatus(appointment: Appointment, status: string): void {
    if (!appointment.id) return;

    this.message = '';
    this.errorMessage = '';

    this.appointmentApi.updateStatus(appointment.id, status).subscribe({
      next: () => {
        this.message = 'Appointment status updated.';
        this.loadAppointments();
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Unable to update appointment status.';
      }
    });
  }
}