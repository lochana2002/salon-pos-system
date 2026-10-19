
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];

  searchQuery = '';
  isLoading = false;
  isSaving = false;
  showForm = false;
  errorMessage = '';
  message = '';

  product = this.emptyProduct();

  ngOnInit(): void {
    this.loadProducts();
  }

  emptyProduct(): Omit<Product, 'id'> {
    return {
      name: '',
      category: '',
      price: 0,
      stock: 0,
      icon: '🧴'
    };
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load products:', error);
        this.errorMessage = 'Unable to load products. Please check the API.';
        this.isLoading = false;
      }
    });
  }

  startAddProduct(): void {
    this.product = this.emptyProduct();
    this.errorMessage = '';
    this.message = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.product = this.emptyProduct();
    this.errorMessage = '';
  }

  
saveProduct(): void {
  this.errorMessage = '';
  this.message = '';

  if (
    !this.product.name.trim() ||
    !this.product.category ||
    this.product.price < 0 ||
    this.product.stock < 0 ||
    !Number.isInteger(Number(this.product.stock))
  ) {
    this.errorMessage = 'Please enter valid product details.';
    return;
  }

  this.isSaving = true;

  this.productService.createProduct({
    ...this.product,
    name: this.product.name.trim(),
    price: Number(this.product.price),
    stock: Number(this.product.stock)
  }).subscribe({
    next: (newProduct) => {
      // Add the newly saved product to the list immediately.
      this.products = [...this.products, newProduct];

      // Close the form and reset it.
      this.product = this.emptyProduct();
      this.showForm = false;
      this.isSaving = false;
      this.message = 'Product added successfully!';
      this.searchQuery = '';
    },
    error: (error) => {
      console.error('Failed to save product:', error);
      this.errorMessage =
        error.error?.message || 'Could not save the product.';
      this.isSaving = false;
    }
  });
}

  get filteredProducts(): Product[] {
    const query = this.searchQuery.toLowerCase().trim();

    return this.products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }

  getTotalStock(): number {
    return this.products.reduce(
      (total, product) => total + product.stock,
      0
    );
  }

  getLowStockCount(): number {
    return this.products.filter(product => product.stock <= 5).length;
  }
}
