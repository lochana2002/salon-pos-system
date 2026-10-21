
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Bank Transfer';

export interface CreateSaleItemRequest {
  itemId: number;
  itemType: 'product' | 'service';
  quantity: number;
}

export interface CreateSaleRequest {
  customerId: number | null;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  items: CreateSaleItemRequest[];
}

export interface SaleResponse {
  message: string;
  saleId: number;
  saleDate: string;
  customerId: number | null;
  paymentMethod: PaymentMethod;
  subtotal: number;
  amountReceived: number;
  changeDue: number;
  items: {
    itemName: string;
    itemType: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
}

export interface TodaySalesSummary {
  totalRevenue: number;
  salesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly http = inject(HttpClient);

  // ASP.NET Core API base URL
  private readonly apiUrl = 'http://localhost:5257/api/Sales';

  // Create a new sale
  createSale(
    request: CreateSaleRequest
  ): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(
      this.apiUrl,
      request
    );
  }

  // Get today's sales summary
  getTodaySales(): Observable<TodaySalesSummary> {
    return this.http.get<TodaySalesSummary>(
      `${this.apiUrl}/today`
    );
  }
}
