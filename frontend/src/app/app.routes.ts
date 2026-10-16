
import { Routes } from '@angular/router';
import { Customers } from './customers/customers';
import { Employees } from './employees/employees';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full'
  },
  {
    path: 'customers',
    component: Customers
  },
  {
    path: 'employees',
    component: Employees
  },
  {
    path: '**',
    redirectTo: 'customers'
  }
];
