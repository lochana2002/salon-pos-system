
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  employees: Employee[] = [];

  editingEmployeeId: number | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  form: Employee = this.emptyForm();

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  emptyForm(): Employee {
    return {
      fullName: '',
      phone: '',
      email: '',
      jobTitle: '',
      salary: 0,
      isActive: true
    };
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage =
          'Could not load employees. Check whether the backend API is running.';
        this.loading = false;
      }
    });
  }

  saveEmployee(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const employee: Employee = {
      fullName: this.form.fullName.trim(),
      phone: this.form.phone.trim(),
      email: this.form.email?.trim() || null,
      jobTitle: this.form.jobTitle.trim(),
      salary: Number(this.form.salary),
      isActive: this.form.isActive ?? true
    };

    if (
      !employee.fullName ||
      !employee.phone ||
      !employee.jobTitle ||
      employee.salary < 0 ||
      !Number.isFinite(employee.salary)
    ) {
      this.errorMessage =
        'Please enter valid employee details and a non-negative salary.';
      return;
    }

    this.saving = true;

    
const request: Observable<unknown> =
  this.editingEmployeeId !== null
    ? this.employeeService.updateEmployee(
        this.editingEmployeeId,
        employee
      )
    : this.employeeService.addEmployee(employee);


    request.subscribe({
      next: () => {
        this.successMessage =
          this.editingEmployeeId !== null
            ? 'Employee updated successfully!'
            : 'Employee added successfully!';

        this.clearForm();
        this.loadEmployees();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving employee:', error);
        this.errorMessage =
          'Could not save employee. Please check the API and entered details.';
        this.saving = false;
      }
    });
  }

  editEmployee(employee: Employee): void {
    this.editingEmployeeId = employee.id ?? null;

    this.form = {
      fullName: employee.fullName,
      phone: employee.phone,
      email: employee.email ?? '',
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      isActive: employee.isActive ?? true
    };

    this.successMessage = '';
    this.errorMessage = '';
  }

  deleteEmployee(employee: Employee): void {
    if (employee.id == null) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${employee.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.successMessage = 'Employee deleted successfully!';
        if (this.editingEmployeeId === employee.id) {
          this.clearForm();
        }
        this.loadEmployees();
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.errorMessage = 'Could not delete employee.';
      }
    });
  }

  clearForm(): void {
    this.form = this.emptyForm();
    this.editingEmployeeId = null;
  }
}
