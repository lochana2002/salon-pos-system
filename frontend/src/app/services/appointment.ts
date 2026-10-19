
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: number;
  customerId: number;
  customerName?: string;
  employeeId: number;
  employeeName?: string;
  salonServiceId: number;
  serviceName?: string;
  servicePrice?: number;
  serviceDurationMinutes?: number;
  startTime: string;
  status?: string;
  notes?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5257/api/appointments';

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  addAppointment(appointment: Appointment): Observable<any> {
    return this.http.post(this.apiUrl, appointment);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }
}
