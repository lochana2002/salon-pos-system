
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { Customers } from './customers/customers';
import { Employees } from './employees/employees';
import { SalonServices } from './salon-services/salon-services';
import { ProductsComponent } from './products/products';
import { Appointments } from './appointments/appointments';
import { PosComponent } from './pos/pos';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public route: users can access login without authentication
  {
    path: 'login',
    component: LoginComponent
  },

  // Protected routes: login required
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'pos',
    component: PosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    component: Customers,
    canActivate: [authGuard]
  },
  {
    path: 'employees',
    component: Employees,
    canActivate: [authGuard]
  },
  {
    path: 'salon-services',
    component: SalonServices,
    canActivate: [authGuard]
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    component: Appointments,
    canActivate: [authGuard]
  },

  // Redirect the home page to the dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Redirect unknown routes to the dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
