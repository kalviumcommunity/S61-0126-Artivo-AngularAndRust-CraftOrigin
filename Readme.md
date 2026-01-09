### Problem Statement

Tribal and rural artists often depend on middlemen to sell their artwork. These intermediaries take a large share of the profit, resulting in unfair pricing, loss of authenticity, and lack of global reach for the artists. Buyers also struggle to find genuine, traceable handmade art directly from creators.

### Proposed Solution

We propose a **web-based marketplace** that directly connects **tribal and rural artists with global buyers**, eliminating middlemen. The platform ensures **fair trade**, **authenticity**, and **global visibility** for traditional art.

* **Angular** will be used to build a scalable, modular, and responsive frontend.
* **Rust** will power a high-performance, secure backend with REST APIs.
* **PostgreSQL** will store artist, product, and transaction data reliably.

This solution empowers artists economically while preserving cultural heritage.

#### Checklist

* **Target users:** Tribal & rural artists, global art buyers
* **Pain point:** Exploitation by middlemen, lack of fair pricing & authenticity
* **Why web-based:** Global accessibility, scalability, easy discovery
* **Why Angular + Rust:** Clean frontend–backend separation, performance, security

---

# Modern Web Architecture: Angular & Rust

## 1. Understanding Angular Components

**What Angular Components Do:**

Angular components are the fundamental building blocks of your user interface. Think of them as LEGO pieces that snap together to create your entire application.

**Key Responsibilities:**
- Display data to users through templates (HTML)
- Handle user interactions (clicks, form inputs, etc.)
- Manage their own state and lifecycle
- Communicate with services to get or send data

**Real-World Analogy:** Components are like different sections of a restaurant - the menu display, the order form, the checkout counter. Each has its own specific job and appearance.

---

## 2. Understanding Angular Services

**What Angular Services Do:**

Services are reusable classes that handle business logic, data fetching, and communication with backend APIs. They keep components clean and focused.

**Key Responsibilities:**
- Make HTTP requests to backend APIs
- Store and manage shared data across components
- Implement business logic that multiple components need
- Act as a single source of truth for data

**Real-World Analogy:** If components are restaurant sections, services are the kitchen staff who actually prepare the food, manage inventory, and coordinate with suppliers.

---

## 3. How HttpClient Sends Requests

**The HttpClient Process:**

Angular's HttpClient is a powerful module that handles all communication with backend servers using HTTP protocol.

**Step-by-Step Flow:**
1. **Component calls service method** → triggers the request
2. **Service uses HttpClient** → prepares HTTP request (GET, POST, PUT, DELETE)
3. **Request is sent** → travels across the network to your Rust backend
4. **Observable pattern** → allows async handling of responses
5. **Response arrives** → data flows back to the component
6. **UI updates** → Angular's change detection refreshes the view

**Request Types:**
- **GET**: Retrieve data from server
- **POST**: Create new data
- **PUT**: Update existing data
- **DELETE**: Remove data

**Example Flow:**
```
typescript
// In Component
loadProducts() {
  // Subscribe to the observable
  this.productService.getProducts().subscribe({
    next: (data) => {
      this.products = data;
      console.log('Products loaded:', data);
    },
    error: (error) => {
      console.error('Error loading products:', error);
    }
  });
}
```

---

## 4. What Rust APIs Do

**The Backend Brain:**

Rust APIs serve as the intelligent backend that processes requests, enforces business rules, and communicates with databases.

**Key Responsibilities:**
- **Receive HTTP requests** from Angular frontend
- **Validate incoming data** to ensure security and correctness
- **Execute business logic** (calculations, rules, workflows)
- **Query databases** to fetch or store data
- **Return JSON responses** back to the frontend
- **Handle authentication & authorization**

**Why Rust?**
- **Blazing Fast**: Near C++ performance
- **Memory Safe**: No null pointers, no data races
- **Type Safe**: Catch errors at compile time
- **Reliable**: Powers systems at Discord, Cloudflare, AWS

---

## 5. How PostgreSQL Fits Into the Flow

**The Data Persistence Layer:**

PostgreSQL is a powerful, enterprise-grade relational database that stores your application's data permanently.

**Role in the Architecture:**
- **Stores structured data** in tables with defined schemas
- **Ensures data integrity** through constraints and relationships
- **Provides ACID guarantees** (Atomicity, Consistency, Isolation, Durability)
- **Handles complex queries** with joins, aggregations, and indexes
- **Scales to millions of records** efficiently

**How Rust Interacts with PostgreSQL:**

Rust uses libraries like SQLx or SeaORM to communicate with PostgreSQL:

```
rust
// SQLx example - Type-safe SQL queries
let products = sqlx::query_as!(
    Product,
    "SELECT id, name, price FROM products WHERE price > $1",
    min_price
)
.fetch_all(&pool)
.await?;
```

**Database Schema Example:**
```
sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Why PostgreSQL?**
- Battle-tested for 30+ years
- Advanced features (JSON, full-text search, geospatial)
- Excellent performance and reliability
- Strong community and tooling support

---

## 6. Complete End-to-End Request Flow

### Full Journey: From Button Click to UI Update

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│                 (Clicks "Load Products" button)              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANGULAR COMPONENT                          │
│  - ProductListComponent calls loadProducts()                │
│  - Delegates to ProductService                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANGULAR SERVICE                            │
│  - ProductService.getProducts()                             │
│  - Uses HttpClient to make GET request                      │
│  - URL: http://localhost:8080/api/products                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼ HTTP REQUEST (Network)
┌─────────────────────────────────────────────────────────────┐
│                    RUST API SERVER                           │
│  - Actix/Axum receives request                              │
│  - Routes to get_products() handler                         │
│  - Validates request                                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  - Check user permissions                                   │
│  - Apply filters or sorting                                 │
│  - Prepare database query                                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                         │
│  - Execute SQL: SELECT * FROM products                      │
│  - Retrieve rows from products table                        │
│  - Return result set to Rust                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   RUST SERIALIZATION                         │
│  - Convert database rows to Product structs                 │
│  - Serialize to JSON format                                 │
│  - Build HTTP response                                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼ HTTP RESPONSE (Network)
┌─────────────────────────────────────────────────────────────┐
│                   ANGULAR SERVICE                            │
│  - Receives JSON response                                   │
│  - Deserializes to TypeScript objects                       │
│  - Returns Observable to component                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANGULAR COMPONENT                          │
│  - Receives data in subscribe callback                      │
│  - Updates component property: this.products = data         │
│  - Triggers change detection                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI UPDATE                               │
│  - Angular re-renders template                              │
│  - User sees product list on screen                         │
│  - Loading spinner disappears                               │
└─────────────────────────────────────────────────────────────┘
```

## 7. Why Type-Safe Systems Matter

### The Power of Type Safety

**Angular (TypeScript) + Rust = End-to-End Type Safety**

**Benefits:**

1. **Catch Errors at Compile Time**
   - Mismatched data types are caught before runtime
   - No more "undefined is not a function" errors
   - IDE provides helpful autocomplete

2. **Self-Documenting Code**
   - Types serve as documentation
   - Easy to understand what data flows where
   - New developers onboard faster

3. **Refactoring Confidence**
   - Change a data structure in one place
   - Compiler tells you everywhere that needs updating
   - No silent failures in production

4. **Better Performance**
   - Rust's zero-cost abstractions
   - No runtime type checking overhead
   - Optimizations at compile time

---

# Artivo - Angular and Rust API Integration

## Understanding Rust Routes, Handlers, and Structs

### Routes
Routes define the URL patterns and HTTP methods that your API accepts. In Actix-web, routes are registered with the web server and map incoming requests to handler functions:

```
rust
App::new()
    .route("/api/items", web::get().to(get_items))
    .route("/api/items", web::post().to(create_item))
```

### Handlers
Handlers are async functions that process incoming requests and return responses. They receive typed data and perform business logic:

```
rust
async fn get_items() -> impl Responder {
    HttpResponse::Ok().json(items)
}
```

### Structs
Structs provide type-safe data structures for request/response bodies. They automatically serialize/deserialize JSON using Serde:

```
rust
#[derive(Deserialize)]
struct CreateItem {
    name: String,
    quantity: i32,
}

#[derive(Serialize)]
struct Item {
    id: i32,
    name: String,
    quantity: i32,
}
```

**How they work together:**
- Routes map URLs to handlers
- Handlers use structs to validate and process data
- Structs ensure type safety at compile time
- The compiler catches mismatches between your code and data structures

---

## Simple Endpoint Example

### POST Endpoint

Here's a simple POST endpoint that receives data and responds with a message:

```
rust
use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;

#[derive(Deserialize)]
struct CreateItem {
    name: String,
    quantity: i32,
}

#[post("/items")]
async fn create_item(item: web::Json<CreateItem>) -> impl Responder {
    HttpResponse::Ok().json(format!("Item created: {}", item.name))
}
```

**What's happening:**
1. Angular sends a JSON body: `{ "name": "Keyboard", "quantity": 10 }`
2. Rust converts that into a typed `CreateItem` struct
3. Rust returns a clean JSON response
4. This is how strongly-typed input/output makes your API reliable

### GET Endpoint

```
rust
use actix_web::{web, HttpResponse, Responder};
use serde::Serialize;

#[derive(Serialize)]
struct Item {
    id: i32,
    name: String,
    quantity: i32,
}

#[get("/items")]
async fn get_items() -> impl Responder {
    let items = vec![
        Item {
            id: 1,
            name: "Keyboard".to_string(),
            quantity: 10,
        },
    ];
    
    HttpResponse::Ok().json(items)
}
```

---

## Angular → Rust → PostgreSQL Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Component                         │
│              (User clicks button, triggers action)            │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Angular Service                            │
│         (HTTPClient POST to /api/items)                     │
│         { "name": "Keyboard", "quantity": 10 }              │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│                    Rust Route                                │
│              (/api/items - POST handler)                     │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Rust Handler                               │
│         (Validates request using CreateItem struct)          │
│         (Type-safe deserialization)                         │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  SQLx Query                                 │
│    INSERT INTO items (name, quantity) VALUES ($1, $2)       │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│              (Stores data, returns result)                  │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Rust Handler                               │
│         (Processes database result)                         │
│         (Returns JSON response)                             │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓ HTTP Response
┌─────────────────────────────────────────────────────────────┐
│                  Angular Service                            │
│         (Receives JSON response)                            │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Angular Component                          │
│         (Updates UI with new data)                          │
└─────────────────────────────────────────────────────────────┘
```

**Flow Summary:**
1. Angular Component triggers action
2. Angular Service sends HTTP request
3. Rust Route receives and routes request
4. Rust Handler validates and processes
5. SQLx Query executes against PostgreSQL
6. Handler returns JSON response
7. Angular Service receives response
8. Angular Component updates UI

---

## Why Type-Safety Helps API Development

Type-safety is one of Rust's greatest advantages for API development. Here's why it matters:

### 1. Compile-Time Error Detection
Rust catches errors before your code runs:
```
rust
// This won't compile if CreateItem doesn't have a 'name' field
let item = CreateItem {
    name: "Keyboard".to_string(),
    quantity: 10,
};
```

### 2. SQL Query Validation
SQLx checks your SQL queries against your database schema at compile time:
```
rust
// If 'items' table doesn't have 'name' column, this won't compile
sqlx::query!("SELECT name FROM items")
```

### 3. Automatic Serialization/Deserialization
Serde ensures JSON structures match your Rust structs:
```
rust
// If Angular sends wrong structure, deserialization fails safely
#[derive(Deserialize)]
struct CreateItem {
    name: String,  // Required field
    quantity: i32, // Required field
}
```

### 4. Refactoring Safety
When you change a struct, the compiler shows you everywhere that needs updating:
```
rust
// Change struct field name
struct CreateItem {
    item_name: String, // Changed from 'name'
    quantity: i32,
}
// Compiler errors show all places using 'name' that need updating
```

### 5. Prevents Runtime Errors
Type-safety prevents common bugs:
- **Null pointer exceptions** → Rust's `Option<T>` and `Result<T, E>` handle this
- **Type mismatches** → Caught at compile time
- **Missing fields** → Compiler error if struct doesn't match
- **SQL injection** → Prepared statements + compile-time checking

### Real-World Impact
In production APIs, type-safety means:
- **Fewer bugs** reach production
- **Faster development** (IDE autocomplete, compiler hints)
- **Easier maintenance** (clear contracts between components)
- **Better performance** (no runtime type checking overhead)

---

## Summary

This README documents:

✅ **How Rust routes, handlers, and structs work** - Routes map URLs to handlers, handlers process requests using typed structs, and structs ensure compile-time type safety

✅ **Simple endpoint example (GET or POST)** - Provided examples showing both GET and POST endpoints with request/response structs

✅ **Diagram showing Angular → Rust → PostgreSQL flow** - Complete request-response cycle from Angular component through Rust handler to PostgreSQL and back

✅ **Note explaining why type-safety helps API development** - Compile-time error detection, SQL validation, automatic serialization, refactoring safety, and prevention of runtime errors