import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { Customers } from './customers/customers';
import { Employees } from './employees/employees';
import { SalonServices } from './salon-services/salon-services';
import { ProductsComponent } from './products/products';
import { Appointments } from './appointments/appointments';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pos', component: DashboardComponent },
  { path: 'customers', component: Customers },
  { path: 'employees', component: Employees },
  { path: 'salon-services', component: SalonServices },
  {
  path: 'products',
  component: ProductsComponent
},
  { path: 'appointments', component: Appointments }, // Use Appointments here
  { path: '**', redirectTo: 'dashboard' }
];