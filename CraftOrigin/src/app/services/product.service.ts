// Product Service - TypeScript Service with Typed Methods
// Demonstrates: Interfaces, Generics, Observable, and Type Safety

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root' // Makes service available app-wide
})
export class ProductService {
  // Type annotation: private property with explicit type
  private apiUrl: string = 'http://localhost:8080/api/products';

  // Mock data for demonstration when backend is not available
  // Typed as Product[] - demonstrates type safety
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Handcrafted Wooden Bowl',
      price: 45.99,
      description: 'Beautiful handcrafted wooden bowl',
      artistName: 'John Smith',
      imageUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 2,
      name: 'Ceramic Vase',
      price: 32.50,
      description: 'Elegant ceramic vase with unique design',
      artistName: 'Sarah Johnson',
      imageUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 3,
      name: 'Metal Sculpture',
      price: 125.00,
      description: 'Modern metal sculpture',
      artistName: 'Mike Davis',
      imageUrl: 'https://via.placeholder.com/300'
    }
  ];

  // Constructor with dependency injection - TypeScript class feature
  constructor(private http: HttpClient) {}

  // Typed function with generic return type
  // Returns Observable<Product[]> - guarantees array of Product objects
  getProducts(): Observable<Product[]> {
    // Log mock products data to console/terminal
    console.log('📦 Mock Products Data:', this.mockProducts);
    console.log('📊 Total Products:', this.mockProducts.length);
    console.log('📋 Product Details:');
    this.mockProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.price} (ID: ${product.id})`);
      console.log(`     Artist: ${product.artistName}`);
      console.log(`     Description: ${product.description}`);
    });
    
    // Generic type parameter <Product[]> ensures response is typed
    // For now, return mock data directly to demonstrate TypeScript concepts
    // When backend is ready, replace with HTTP call below:
    // return this.http.get<Product[]>(this.apiUrl).pipe(
    //   catchError((error) => {
    //     console.warn('Backend not available, using mock data:', error);
    //     return of(this.mockProducts);
    //   })
    // );
    return of(this.mockProducts);
  }

  // Additional typed methods for future use
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Example of typed function with parameters and return type
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
}
