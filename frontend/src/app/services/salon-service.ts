
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalonService {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalonServiceApi {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5257/api/SalonServices';

  getServices(): Observable<SalonService[]> {
    return this.http.get<SalonService[]>(this.apiUrl);
  }

  addService(service: SalonService): Observable<SalonService> {
    return this.http.post<SalonService>(this.apiUrl, service);
  }

  updateService(
    id: number,
    service: SalonService
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
