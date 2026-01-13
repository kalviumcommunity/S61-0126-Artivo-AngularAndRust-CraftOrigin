// Product Interface - TypeScript Model
// This interface matches the Rust backend Product struct
// Ensures type safety between Angular frontend and Rust backend

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;  
  artistName?: string;  
  imageUrl?: string;   
}
