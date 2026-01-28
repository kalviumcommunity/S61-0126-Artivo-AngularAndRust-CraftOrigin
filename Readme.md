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


## Concept - 3

# Concept 3: Creating Interactive, Modular Frontends with Angular

## Overview

This document explains how Angular’s component-driven and modular architecture is used to build scalable frontend applications and how it integrates with a Rust backend. The goal is to demonstrate clean UI structuring, separation of concerns, and smooth frontend–backend communication.

---

## 1. Angular Architecture Used

Angular applications are built using a layered architecture:

* **Components** – Handle UI rendering and user interaction
* **Services** – Handle business logic and API communication
* **Modules** – Organize related features
* **Routing** – Manage navigation between pages

This structure ensures scalability and maintainability as the application grows.

---

## 2. Angular Components

### Purpose

Components are the building blocks of the UI. Each component is responsible for a specific part of the interface.

### Example: Product Card Component

* Displays product data
* Receives data using `@Input()`
* Handles user actions such as button clicks

**Responsibilities:**

* UI rendering
* Event handling

**Not Responsible For:**

* API calls
* Business logic

---

## 3. Angular Modules

### Purpose

Modules group related components and services into features. This keeps the application organized and prevents code duplication.

### Example: Product Module

* Contains product-related components
* Imports common Angular utilities

**Benefits:**

* Feature isolation
* Easier scaling
* Cleaner folder structure

---

## 4. Angular Services

### Purpose

Services manage shared logic and communication with the backend.

### Example: Product Service

* Sends HTTP requests to Rust APIs
* Returns observable data to components

**Key Responsibilities:**

* API calls
* Shared state management
* Business rules

This keeps components lightweight and focused only on UI logic.

---

## 5. Angular ↔ Rust API Interaction

### Communication Flow

1. User interacts with the UI
2. Component triggers a method
3. Service sends HTTP request
4. Rust backend receives request
5. Rust handler fetches data from database
6. JSON response is returned
7. Angular updates component state
8. UI updates automatically

This REST-based interaction allows Angular and Rust to evolve independently.

---

## 6. Data Binding

Angular uses data binding to automatically reflect data changes in the UI.

* When component data changes
* The UI updates instantly
* No manual DOM manipulation is required

This makes Angular ideal for dashboards and real-time interfaces.

---

## 7. Handling User Interactions

Angular uses event binding to respond to user actions such as clicks and form submissions.

**Example Use Cases:**

* Adding items to cart
* Submitting forms
* Triggering API calls

This creates predictable and reactive UI behavior.

---

## 8. Routing

### Purpose

Routing enables navigation between different views without page reloads.

### Example Routes

* `/products` – Product list page
* `/products/:id` – Product detail page

Routing is essential for building:

* Admin dashboards
* Inventory systems
* E-commerce platforms

---

## 9. Overall UI Architecture

```
App Module
   ↓
Feature Modules
   ↓
Components
   ↓
Services
   ↓
Rust Backend (Axum / Actix)
   ↓
PostgreSQL Database
```

This layered structure ensures clear separation of concerns.

---

## 10. Case Study: View Products Flow

**Scenario:** A user clicks “View Products”

1. User clicks the button
2. Angular component handles the click event
3. Component calls the product service
4. Service sends GET request to `/api/products`
5. Rust route handler executes
6. Data is fetched from database
7. JSON response is returned
8. Angular receives data
9. UI updates automatically

---

## 11. Reflection: Why Modular Architecture Matters

* Improves code readability
* Enables team collaboration
* Makes features reusable
* Simplifies testing
* Allows frontend and backend to scale independently

Modular architecture is critical for building production-ready applications.

---

## 12. Deliverables Summary

This implementation includes:

* Angular components for UI rendering
* Angular services for API communication
* Modular folder structure
* Routing configuration
* Rust API integration
* Clear frontend–backend flow

---

## Conclusion

By following Angular’s modular architecture and separating UI from logic, we can build scalable, maintainable frontend applications that integrate cleanly with Rust backend services.

# Setting Up Angular CLI, Rust Toolchain, and Actix/Axum Environment

This step involves configuring a full-stack development environment that combines an Angular frontend with a Rust-based backend using modern, high-performance web frameworks such as Actix-Web or Axum.

On the frontend side, Angular CLI is installed and configured to scaffold, build, and manage the Angular application efficiently. It provides tools for component generation, development server execution, and production builds, enabling rapid and structured UI development.

For the backend, the Rust toolchain is installed using rustup, which includes the Rust compiler (rustc), package manager (cargo), and essential developer tools such as clippy (for linting) and rustfmt (for code formatting). This setup ensures safe, fast, and maintainable backend development.

Using Cargo, a Rust backend project is created and configured with either Actix-Web or Axum, both asynchronous web frameworks built on the Tokio runtime. These frameworks enable the creation of a lightweight HTTP server, routing, and API endpoints that can serve JSON responses and communicate with the Angular frontend.

Together, this environment establishes a scalable and performant full-stack foundation, enabling seamless communication between the Angular client and the Rust backend while following modern development best practices.

# CraftOrigin - Project Structure Guide

## 📌 What is CraftOrigin?

**CraftOrigin** is a marketplace that connects **tribal and rural artists** directly with **global buyers**, eliminating middlemen and ensuring fair prices.

- **Frontend**: Angular (User Interface)
- **Backend**: Rust (Server & API)
- **Database**: PostgreSQL (Data Storage)

---

## 🗂️ Project Structure Overview

```
craftorigin/
├── frontend/          # Angular application (UI)
├── backend/           # Rust application (API server)
└── README.md          # This file
```

---

## 🎨 Frontend Structure (Angular)

### 📁 Main Folders

```
frontend/
├── src/
│   ├── app/                    # Main application code
│   │   ├── components/         # UI components (pages & parts)
│   │   ├── services/           # API calls to Rust backend
│   │   ├── guards/             # Route protection (login required)
│   │   ├── models/             # TypeScript types/interfaces
│   │   ├── app.component.ts    # Root component (main entry)
│   │   ├── app.module.ts       # Main module (imports everything)
│   │   └── app-routing.module.ts  # Page routes
│   ├── assets/                 # Images, icons, fonts
│   ├── environments/           # Config (dev/prod URLs)
│   └── index.html              # Main HTML file
├── angular.json                # Build configuration
└── package.json                # Dependencies (npm packages)
```

---

### 📂 What Each Folder Does

#### 1. **src/app/components/** - UI Pages & Parts
Each feature gets its own folder with 3 files:

```
components/
├── login/
│   ├── login.component.ts      # Logic (TypeScript)
│   ├── login.component.html    # HTML template
│   └── login.component.css     # Styling
├── product-list/
├── product-detail/
├── create-product/
├── cart/
├── checkout/
└── dashboard/
```

**What it does**: Contains all the pages users see (login, products, cart, checkout, dashboard)

---

#### 2. **src/app/services/** - Talks to Rust Backend
Services make HTTP calls to the backend API.

**What it does**: Sends requests to Rust backend and gets data back

**Services we have**:
- `auth.service.ts` - Handles login and registration
- `product.service.ts` - Gets and creates products
- `cart.service.ts` - Manages shopping cart
- `order.service.ts` - Places orders
- `artist.service.ts` - Artist profile management
- `file-upload.service.ts` - Uploads product images

---

#### 3. **src/app/guards/** - Protect Routes
Guards check if user is logged in before showing a page.

**What it does**: Blocks unauthorized users from accessing certain pages

**Guards we have**:
- `auth.guard.ts` - Checks if user is logged in
- `role.guard.ts` - Checks if user is artist or buyer

---

#### 4. **src/app/models/** - Data Types
Defines what data looks like (TypeScript interfaces).

**What it does**: Ensures data has correct structure (type safety)

**Models we have**:
- `user.model.ts` - User data structure
- `product.model.ts` - Product data structure
- `order.model.ts` - Order data structure
- `cart.model.ts` - Cart data structure

---

#### 5. **app.module.ts** - The Brain
Imports all components, services, and modules.

**What it does**: Tells Angular what components and services exist in the app

---

#### 6. **app-routing.module.ts** - Page Navigation
Defines all the routes (URLs) in the application.

**What it does**: Maps URLs to components (e.g., /login → LoginComponent)

---

#### 7. **package.json** - Dependencies
Lists all npm packages (libraries) the project needs.

**What it does**: Keeps track of external libraries like Angular, RxJS, etc.

**How to install**: Run `npm install`

---

## 🦀 Backend Structure (Rust)

### 📁 Main Folders

```
backend/
├── src/
│   ├── main.rs              # Server starts here
│   ├── routes/              # API endpoints (/login, /products)
│   ├── handlers/            # Business logic (what happens when API is called)
│   ├── models/              # Database structs
│   ├── services/            # Reusable business logic
│   ├── config/              # Settings (database URL, JWT secret)
│   └── middleware/          # JWT authentication
├── migrations/              # Database schema (SQL files)
├── Cargo.toml               # Dependencies (like package.json)
└── .env                     # Secret keys, database URL
```

---

### 📂 What Each Folder Does

#### 1. **src/main.rs** - Server Entry Point
This is where the Rust server starts.

**What it does**: 
- Connects to PostgreSQL database
- Starts the web server on port 8080
- Registers all API routes

---

#### 2. **src/routes/** - API Endpoints
Defines URL paths and maps them to handlers.

**What it does**: Maps URLs to handler functions

**Routes we have**:
- `auth.rs` - `/auth/login`, `/auth/register`
- `products.rs` - `/products`, `/products/{id}`
- `orders.rs` - `/orders`, `/orders/{id}`
- `artists.rs` - `/artists`, `/artists/{id}`
- `upload.rs` - `/upload/images`

---

#### 3. **src/handlers/** - Business Logic
Handlers process requests and return responses.

**What it does**: 
- Receives requests from Angular
- Queries the database
- Processes the data
- Returns JSON response

**Handlers we have**:
- `auth_handler.rs` - Login, register, logout
- `product_handler.rs` - CRUD operations for products
- `order_handler.rs` - Create and manage orders
- `artist_handler.rs` - Artist profile management
- `upload_handler.rs` - File upload handling

---

#### 4. **src/models/** - Data Structures
Defines what data looks like (structs).

**What it does**: Defines data structure for database tables and API requests

**Models we have**:
- `user.rs` - User struct
- `product.rs` - Product struct
- `order.rs` - Order struct
- `request_dto.rs` - Request data structures
- `response_dto.rs` - Response data structures

---

#### 5. **src/services/** - Reusable Logic
Business logic that can be used by multiple handlers.

**What it does**: Contains reusable functions

**Services we have**:
- `auth_service.rs` - Password hashing, JWT creation
- `validation_service.rs` - Input validation
- `email_service.rs` - Send emails to users
- `search_service.rs` - Product search functionality

---

#### 6. **migrations/** - Database Schema
SQL files that create database tables.

**What it does**: Creates database structure

**Migration files**:
- `001_create_users.sql` - Users table
- `002_create_products.sql` - Products table
- `003_create_orders.sql` - Orders table
- `004_create_reviews.sql` - Reviews table

**How to run**: `sqlx migrate run`

---

#### 7. **Cargo.toml** - Dependencies
Lists all Rust libraries (crates) needed.

**What it does**: Manages Rust dependencies

**Main dependencies**:
- `actix-web` - Web framework for building APIs
- `sqlx` - Database connection and queries
- `serde` - JSON serialization/deserialization
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token creation and validation

**How to install**: `cargo build`

---

#### 8. **.env** - Secret Configuration
Stores sensitive data (NOT committed to Git).

**What it does**: Stores database URLs, JWT secrets, and other configuration

---

## 🔄 How Angular & Rust Work Together

### Complete Flow: User Views Products

1. **User clicks "Products" page**
2. **Angular**: ProductListComponent loads
3. **Angular**: Calls `productService.getProducts()`
4. **Angular**: Sends HTTP GET request to `http://localhost:8080/api/products`
5. **Rust**: main.rs receives the request
6. **Rust**: routes/products.rs routes to `get_products` handler
7. **Rust**: handlers/product_handler.rs executes `get_products()`
8. **Rust**: Queries PostgreSQL database for products
9. **Rust**: Returns JSON response with product list
10. **Angular**: Receives JSON data
11. **Angular**: Updates UI with products
12. **User**: Sees product list on screen

---

## 🛠️ Case Study: Creating a "Create Product" Feature

### Question: Which files would you need to edit?

#### **Angular Side (Frontend)**

1. **Create Component**:
   - **Location**: `src/app/components/create-product/`
   - **Files**: 
     - `create-product.component.ts` - Form logic
     - `create-product.component.html` - Form HTML
     - `create-product.component.css` - Styling
   - **Why**: This is the page where artists fill out the form

2. **Service**:
   - **Location**: `src/app/services/product.service.ts`
   - **What to add**: A method called `createProduct()` that sends POST request
   - **Why**: To send product data to Rust backend

3. **Router**:
   - **Location**: `src/app/app-routing.module.ts`
   - **What to add**: Route path `/product/create`
   - **Why**: So users can navigate to the create product page

4. **Model**:
   - **Location**: `src/app/models/product.model.ts`
   - **What to add**: Interface for CreateProductDto
   - **Why**: Type safety for form data

---

#### **Rust Side (Backend)**

1. **Route**:
   - **Location**: `src/routes/products.rs`
   - **What to add**: POST route that maps to create_product handler
   - **Why**: Maps POST /products to handler function

2. **Handler**:
   - **Location**: `src/handlers/product_handler.rs`
   - **What to add**: Function `create_product()` that inserts into database
   - **Why**: Handles the actual product creation logic

3. **Model**:
   - **Location**: `src/models/product.rs`
   - **What to add**: Struct `CreateProductRequest`
   - **Why**: Defines what data backend expects from frontend

4. **Database Migration**:
   - **Location**: `migrations/002_create_products_table.sql`
   - **Status**: Already exists (products table already created)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ (for Angular)
- Rust 1.70+ (for backend)
- PostgreSQL 15+ (database)

### Frontend Setup
```
bash
cd frontend
npm install
ng serve
```
**Opens at**: http://localhost:4200

### Backend Setup
```
bash
cd backend
cargo build
sqlx migrate run
cargo run
```
**Runs on**: http://localhost:8080

---

## 🧪 Testing

### Angular Tests
```
bash
cd frontend
ng test           # Unit tests
ng e2e            # End-to-end tests
```

### Rust Tests
```
bash
cd backend
cargo test        # Run all tests
```

---

## 📝 Key Files Summary

| File | Purpose |
|------|---------|
| **Angular (Frontend)** |
| `src/app/app.module.ts` | Main module, imports all components and services |
| `src/app/services/*.service.ts` | Makes API calls to Rust backend |
| `src/app/components/*` | All UI pages (login, products, cart, etc.) |
| `src/app/guards/auth.guard.ts` | Protects routes from unauthorized access |
| `package.json` | Lists all Angular dependencies |
| **Rust (Backend)** |
| `src/main.rs` | Server entry point, starts the application |
| `src/routes/*.rs` | Defines API endpoint URLs |
| `src/handlers/*.rs` | Contains business logic for each endpoint |
| `src/models/*.rs` | Data structures for database and API |
| `Cargo.toml` | Lists all Rust dependencies |
| `migrations/*.sql` | Database table creation scripts |
| `.env` | Secret configuration (database URL, JWT secret) |

Here is a **short, clean, README-friendly description** you can directly paste 👇
(kept simple and professional, as mentors prefer)

---

## Introduction to TypeScript Fundamentals for Angular Development

TypeScript is the core language used in Angular applications. It enhances JavaScript by adding strong typing, structure, and better tooling support. Using TypeScript helps developers catch errors early, write cleaner code, and build scalable and maintainable applications.

In this project, TypeScript fundamentals such as types, interfaces, classes, functions, and generics are used extensively in Angular components and services. These concepts ensure consistent data handling, safe API integration with the Rust backend, and predictable application behavior throughout Sprint #2.

---


# Rust Memory Model: Ownership, Borrowing, and Lifetimes

Rust’s memory model is the main reason it is considered one of the safest backend languages. Instead of relying on a garbage collector, Rust uses strict compile-time rules to manage memory. These rules prevent common bugs like null pointer access, data races, and memory leaks.

The three core ideas behind this system are **Ownership**, **Borrowing**, and **Lifetimes**.

---

## 1. Ownership

In Rust, **every value has exactly one owner**.
When the owner goes out of scope, Rust automatically frees the memory.

This means Rust always knows:

* Who owns the data
* When the data should be cleaned up

### Simple Explanation

Think of ownership like holding a key to a room. Only one person can have the key. When that person leaves, the room is locked and cleaned.

### Example (Backend-style)

```rust
fn main() {
    let request_body = String::from("user data");
    process_request(request_body);
    // request_body is no longer valid here
}

fn process_request(data: String) {
    println!("{}", data);
}
```

Here:

* `request_body` owns the string
* Ownership is **moved** to `process_request`
* After the function call, `request_body` cannot be used again

This prevents accidental use of freed memory.

---

## 2. Borrowing

Sometimes we don’t want to transfer ownership.
Instead, we want to **temporarily access** data. This is called **borrowing**.

Rust allows:

* Multiple **immutable** borrows (`&T`)
* OR one **mutable** borrow (`&mut T`)
* But **not both at the same time**

### Simple Explanation

Borrowing is like lending a book:

* You can let many people read it (immutable borrow)
* Or let one person write in it (mutable borrow)
* But not both together

### Example (Backend-style)

```rust
fn main() {
    let user = String::from("Alice");
    print_user(&user); // borrowed, not moved
    println!("{}", user); // still valid
}

fn print_user(name: &String) {
    println!("User: {}", name);
}
```

Here:

* Ownership stays in `main`
* `print_user` only borrows the data
* This avoids unnecessary copying and improves performance

---

## 3. Mutable Borrowing

Mutable borrowing allows changing data, but Rust ensures safety by allowing **only one mutable reference at a time**.

### Example

```rust
fn main() {
    let mut counter = 0;
    increment(&mut counter);
    println!("{}", counter);
}

fn increment(value: &mut i32) {
    *value += 1;
}
```

This rule prevents race conditions, which is critical for backend systems handling multiple requests.

---

## 4. Lifetimes

Lifetimes tell Rust **how long references are valid**.
Rust uses lifetimes to make sure a reference never outlives the data it points to.

Most of the time, Rust figures this out automatically. We only need to write lifetimes when Rust needs clarification.

### Simple Explanation

A reference should never point to data that has already been destroyed.

### Example

```rust
fn get_longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() {
        a
    } else {
        b
    }
}
```

Here:

* `'a` means both inputs and the output must live at least as long as `'a`
* Rust guarantees the returned reference is always valid

---

## Conclusion

Rust’s memory model may feel strict at first, but it provides powerful guarantees:

* **Ownership** ensures automatic and safe memory cleanup
* **Borrowing** allows efficient data access without copying
* **Lifetimes** prevent dangling references

Together, these features make Rust extremely reliable for backend development, especially in systems where performance and safety are critical.

Here’s a **short and clean README** you can use for a **basic Actix or Axum backend with a health check endpoint**.

---

# Basic Rust Backend (Actix / Axum)

This project demonstrates how to create a minimal backend server in **Rust** using **Actix Web** or **Axum**, with a simple **health check endpoint** to verify that the server is running.

## Features

* Lightweight and fast Rust web server
* Health check endpoint (`/health`)
* Easy to extend with APIs, middleware, and databases

## Health Check Endpoint

```
GET /health
```

**Response:**

```json
{
  "status": "ok"
}
```

This endpoint is commonly used for monitoring, load balancers, and container orchestration systems.

## Tech Stack

* Rust
* Actix Web **or** Axum
* Tokio (async runtime)

## Running the Project

```bash
cargo run
```

Server will start at:

```
http://127.0.0.1:8080
```

# Defining Structs, Enums, and Data Models in Rust


## What I Learned and Understood from This Module

In this module, I learned the importance of **data modeling in backend systems using Rust**. I understood that a backend is not just about handling requests and responses, but about defining **clear and safe data contracts** that prevent invalid data from ever entering the system.

I learned that in Rust, **data models are enforced at compile time**, which makes backend logic more reliable and predictable compared to loosely typed systems.

---

### Understanding the Role of Structs

I learned how to use **Rust structs** to represent backend entities such as users, accounts, request bodies, and responses. I understood that a struct defines **exactly what data is allowed** and that Rust does not permit missing or extra fields.

From this, I realized that structs act as **blueprints for backend data**, ensuring that all data used in the application follows a strict and predictable structure.

Example I understood:

```rust
struct User {
    id: i32,
    name: String,
    email: String,
}
```

---

### Understanding Request Handling with Structs

I learned how structs are used in backend APIs to **deserialize incoming JSON requests** safely. I understood that when using libraries like Serde, Rust automatically rejects invalid request data before it reaches the business logic.

This helped me understand how Rust makes APIs safer by default and reduces the need for manual validation.

---

### Understanding the Power of Enums

I learned how **Rust enums** are used to represent values that can exist in only a fixed set of states. I understood that enums are much safer than using strings for roles, statuses, or states.

This helped me understand how enums prevent invalid states such as typos or unexpected values from occurring in the application.

Example I understood:

```rust
enum AccountStatus {
    Active,
    Suspended,
    Deleted,
}
```

---

### Preventing Invalid States

I understood that one of Rust’s biggest strengths is its ability to **prevent invalid states at compile time**. By modeling states using enums, I learned that many runtime errors can be completely eliminated.

This made me realize that good data modeling reduces the need for defensive programming and repeated runtime checks.

---

### Combining Structs and Enums

I learned how real-world backend systems combine **structs and enums** to model complex data safely. I understood that embedding enums inside structs ensures that important fields always contain valid values.

Example I understood:

```rust
struct Account {
    id: i32,
    email: String,
    status: AccountStatus,
}
```

---

### Pattern Matching and Exhaustiveness

I learned how **pattern matching** with enums forces me to handle all possible cases explicitly. I understood that Rust’s `match` statement makes backend logic future-proof, because adding a new enum variant will cause compile-time errors until all cases are handled.

This helped me understand how Rust enforces correctness through the compiler.

---

### Modeling API Responses

I learned that enums can also be used to model **API responses** in a clear and predictable way. I understood that response types should be explicit so that both the server and client know exactly what kind of response is being returned.

---

### Overall Understanding

From this module, I understood that **strong data modeling is the foundation of reliable backend development in Rust**. By using structs and enums effectively, I can design systems where invalid data is impossible, logic is easier to reason about, and errors are caught early during development instead of at runtime.

This module gave me a strong foundation for building safe and maintainable Rust backends using frameworks like Actix or Axum.


# Angular Components: Quick Summary

## What You Learned
- Components are the building blocks of Angular apps (logic, template, style).
- Use Angular CLI: `ng generate component <name>` to scaffold new components.
- Use `@Component` to define selector, template, and styles.
- Data binding (`{{ }}`) and event binding (`(click)`) make UIs interactive.
- Component styles are scoped and modular.
- Use your component in any template with its selector (e.g., `<app-user-card>`).

## What You Built Today
- Created and integrated a `FeaturedArtistsComponent` showing a grid of artists.
- Used lucide-angular icons and fixed SSR/browser rendering issues.
- Debugged and fixed Angular/TypeScript errors.
- Practiced modular, reusable UI design.

## Why It Matters
- We can now build, style, and use Angular components for any UI feature.
- Now we know how to debug and document your work for your project.

---

## Actix REST API

A simple REST API built using **Rust** and **Actix Web**, demonstrating how to create typed routes, handlers, and JSON-based request/response models.

---

## Features

* RESTful API structure
* Typed request & response models using Serde
* JSON request handling
* Proper HTTP status codes
* Clean separation of routes, handlers, and models

---

## Tech Stack

* Rust
* Actix Web
* Serde (JSON serialization/deserialization)

---

## Project Structure

```
src/
 ├── main.rs
 ├── routes/
 ├── handlers/
 └── models/
```

---

## Running the Server

```bash
cargo run
```

Server will start at:

```
http://localhost:8080
```

---

## API Endpoints

| Method | Endpoint    | Description    |
| ------ | ----------- | -------------- |
| GET    | /users      | Get all users  |
| POST   | /users      | Create a user  |
| GET    | /users/{id} | Get user by ID |

---

## Testing with cURL

```bash
curl http://localhost:8080/users
```

```bash
curl -X POST http://localhost:8080/users \
-H "Content-Type: application/json" \
-d '{"name":"Alex","email":"alex@test.com"}'
```

---

## Learning Goal

This project is intended for learning:

* REST API concepts in Rust
* Actix routing & handlers
* Safe and predictable backend design


# Angular CLI – Learning Documentation 

In this lesson, I learned how to use the **Angular CLI**, the command-line tool that powers Angular applications.

Angular CLI acts like a **developer toolkit**. It automates repetitive tasks, enforces best practices, and helps keep Angular projects **scalable, clean, and maintainable**.

By the end of this session, I understood how to:

* Create Angular files using CLI generators
* Run an Angular app locally
* Build optimized production bundles
* Run unit tests
* Understand when and why each CLI command is used


---

## 1️⃣ What is Angular CLI?

Angular CLI (Command-Line Interface) is a powerful tool provided by Angular to simplify development.

It helps by:

* Generating boilerplate code automatically
* Setting up best-practice folder structures
* Running a local development server
* Creating optimized production builds
* Handling unit testing setup

👉 Instead of manually creating files and configurations, Angular CLI does everything for you in a structured and reliable way.

---

## 2️⃣ Installing Angular CLI

If Angular CLI is not already installed, use the following command:

```bash
npm install -g @angular/cli
```

To verify installation:

```bash
ng version
```

A successful installation shows:

* Angular version
* Node.js version
* Angular CLI version

---

## 3️⃣ Essential Angular CLI Commands

### A. Generating Code – `ng generate` / `ng g`

Angular CLI allows us to generate most Angular files automatically.

#### Generate a Component

```bash
ng generate component dashboard
```

or shorter:

```bash
ng g c dashboard
```

This creates:

```
dashboard/
 ├─ dashboard.component.ts
 ├─ dashboard.component.html
 ├─ dashboard.component.css
 └─ dashboard.component.spec.ts
```

---

#### Generate a Service

```bash
ng g s auth
```

Creates a service file used for business logic or API calls.

---

#### Generate a Module

```bash
ng g m user
```

Creates a module to group related features.

---

#### Why Code Generation Matters

* Maintains consistent project structure
* Automatically registers components (for non-standalone apps)
* Saves development time
* Prevents manual setup errors

---

### B. Running the App Locally – `ng serve`

To start the development server:

```bash
ng serve
```

or:

```bash
ng s
```

Open in browser:

```
http://localhost:4200
```

#### Features

* Hot Reload → UI updates instantly on save
* Compilation warnings → shows template & TypeScript errors
* Ideal for fast development and debugging

---

### C. Building the App – `ng build`

To create a production-ready build:

```bash
ng build
```

For optimized output:

```bash
ng build --configuration production
```

This generates a **dist/** folder containing:

* Minified JavaScript and CSS
* Optimized bundles
* Assets ready for deployment

👉 This build can be deployed using Rust backend or any hosting service.

---

### D. Running Tests – `ng test`

Angular uses **Karma + Jasmine** for unit testing.

Run tests using:

```bash
ng test
```

This:

* Launches the test runner
* Watches file changes
* Displays pass/fail results
* Helps maintain code quality

Unit testing becomes very important as the project grows.

---

## 4️⃣ CLI Workflow Cheat Sheet

| Task                 | Command                               | Purpose                             |
| -------------------- | ------------------------------------- | ----------------------------------- |
| Create a component   | `ng g c name`                         | Generates TS, HTML, CSS, spec files |
| Create a service     | `ng g s name`                         | Creates injectable service          |
| Serve locally        | `ng serve`                            | Starts dev server with hot reload   |
| Build for production | `ng build --configuration production` | Creates optimized bundle            |
| Run tests            | `ng test`                             | Runs unit tests                     |
| Check versions       | `ng version`                          | Shows Angular & Node versions       |

---

## 5️⃣ Small Practice Exercise (Recommended)

### Step 1: Generate a Component

```bash
ng g c counter
```

### Step 2: Add Logic

Inside `counter.component.ts`:

* Add a number variable
* Create `increment()` and `decrement()` methods

### Step 3: Template

* Display the count
* Add **+** and **−** buttons
* Bind button clicks to methods

### Step 4: Run the App

```bash
ng serve
```

This exercise reinforces:

* CLI code generation
* Data binding
* Event handling
* Debugging with live reload

---

## 6️⃣ My Understanding After This Lesson

After completing this lesson, I can clearly answer:

* **Which CLI command creates components?**
  → `ng g c`

* **How do I run an Angular app locally?**
  → `ng serve`

* **What does the build process generate?**
  → An optimized production bundle inside `dist/`

* **How do I run tests?**
  → `ng test`

These fundamentals are essential for fast and confident development during the sprint.

---

# Responsive Layouts in Angular: Lesson Summary & Today's Progress

## What You Learned

### 1. Responsive Design Principles
- Responsive design adapts layouts to different screen sizes (mobile, tablet, desktop, large screens).
- Ensures content remains readable and usable without horizontal scrolling or broken layouts.
- UI components reorganize intelligently for a seamless user experience.

### 2. CSS Flexbox (One-Dimensional Layouts)
- Flexbox is ideal for arranging items in a row or column.
- Example:
  ```css
  .container { display: flex; gap: 12px; flex-wrap: wrap; }
  .card { flex: 1 1 200px; padding: 12px; border: 1px solid #ccc; }
  ```
- Items wrap automatically and maintain spacing on smaller screens.

### 3. CSS Grid (Two-Dimensional Layouts)
- CSS Grid is perfect for layouts with both rows and columns (e.g., dashboards, product cards).
- Example:
  ```css
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
  ```
- Grid adapts the number of columns based on screen size, often without media queries.

### 4. Responsive Breakpoints with Media Queries
- Use media queries for finer control:
  ```css
  @media (max-width: 768px) { .container { flex-direction: column; } }
  ```
- Switches layout direction or other styles at specific screen widths.

### 5. Angular Flex Layout (Optional)
- Angular Flex Layout provides directive-based responsiveness (e.g., `fxLayout`, `fxFlex`).
- Example:
  ```html
  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="12px">
    <div fxFlex="50">Left</div>
    <div fxFlex="50">Right</div>
  </div>
  ```
- Minimal CSS, responsive out-of-the-box.

### 6. Combining Responsiveness with Angular Data Binding
- Use `*ngFor` to render responsive grids of components (e.g., product cards).
- Layout remains responsive as data changes.


## Today's Work & Achievements

- Fixed SSR and icon rendering issues in Angular (How It Works section)
- Integrated static SVG icons and ensured correct asset paths
- Matched color schemes and backgrounds to React reference (Discover & Impact steps)
- Added/updated CSS for backgrounds, text, and font styles for pixel-perfect match
- Ensured responsive layout for the How It Works steps using CSS Grid
- Verified UI matches design on desktop and mobile
- Learned and applied best practices for responsive, maintainable Angular UIs

---

Here is the revised version with **“you” removed and replaced with “I”**, while keeping the explanation clear, professional, and well-structured.

---

# Angular Data Binding & Call To Action Module

## What I Learned Today

### 1. Angular Data Binding Fundamentals

Angular provides multiple data binding techniques to connect component logic with the UI. Each serves a specific purpose:

* **Interpolation (`{{ value }}`)**
  Used to display dynamic data from the component inside the HTML template. It is ideal for rendering text such as titles, labels, and messages.

* **Property Binding (`[property]`)**
  Allows binding component data directly to HTML element properties like `[src]`, `[disabled]`, or `[class]`. This is useful for dynamically controlling UI behavior and attributes.

* **Event Binding (`(event)`)**
  Enables the application to respond to user interactions such as button clicks, form submissions, or input changes using methods defined in the component.

* **Two-Way Binding (`[(ngModel)]`)**
  Creates real-time synchronization between form inputs and component data. When the input value changes, the component updates automatically—and vice versa.

* **Best Practices**
  Choosing the correct type of binding ensures cleaner code, better performance, and easier maintenance. Display data with interpolation, control behavior with property binding, respond to actions with event binding, and handle user input with two-way binding.

---

### 2. Practical Implementation: Call To Action Component

These data binding concepts were applied by building a complete **Call To Action (CTA) component**:

* Built a visually appealing and responsive CTA section using Angular and CSS.
* Integrated SVG icons from the assets folder to enhance branding and clarity.
* Applied modern UI techniques such as background patterns, blur effects, and clean spacing.
* Ensured text, buttons, and trust indicators were accurately aligned and matched the reference design.
* Used Angular data binding to:

  * Control button states
  * Handle click events
  * Display dynamic headings and descriptions
* Refined layout, spacing, and typography to achieve a polished, professional appearance.

---

### 3. Responsive & Accessible UI

The focus was on building an interface that works well across devices and is accessible:

* Designed layouts that adapt smoothly to different screen sizes.
* Used Flexbox for alignment, spacing, and consistent layout behavior.
* Ensured trust points appear in a single line on desktop screens.
* Applied semantic HTML and meaningful alt text to improve accessibility and usability.

---

### 4. Key Takeaways

* Angular data binding is fundamental for building interactive and maintainable applications.
* Combining Angular logic with modern CSS techniques results in clean, visually rich user interfaces.
* Proper asset management (SVGs, images, icons) plays a critical role in branding and UI clarity.
* Iterative design improvements and attention to detail help deliver professional-quality results.

---

## What I Implemented

A complete **Call To Action section** was successfully built with:

* Dynamic headings, subtitles, and buttons
* SVG icons loaded from the assets directory
* A modern background pattern with visual effects
* A responsive row of trust points
* Practical use of all Angular data binding types
* A layout that matches the reference design in color, typography, and spacing
* Improved user experience and accessibility best practices

---

# Reusable UI Components & Shared Modules – Learning & Implementation

## Overview

In this module, I learned how to design **reusable UI components** in Angular and organize them using **Shared Modules**.
The focus was on writing clean, maintainable code that can be reused across multiple pages without duplication.

This approach helps in building scalable Angular applications with consistent UI and better teamwork.

---

## What I Learned

### 1. Importance of Reusability

I learned why reusing components is important in real-world applications:

* It reduces duplicate code and bugs
* It keeps the UI consistent across the application
* It speeds up development
* It follows the **DRY (Don’t Repeat Yourself)** principle

Instead of rewriting the same button, card, or layout multiple times, we can create it once and reuse it everywhere.

---

### 2. What Makes a Component Reusable

I understood that a reusable component should:

* Accept data and configuration using `@Input()`
* Communicate user actions using `@Output()`
* Avoid page-specific or business logic
* Have flexible and configurable styles

This ensures the component can be used in different parts of the application without modification.

---

### 3. Using `@Input()` for Configuration

I learned how `@Input()` allows parent components to pass data into child components.

#### Example Learning:

* A button component should not hardcode text or state
* Instead, label and disabled state should come from inputs

```ts
@Input() label = 'Click';
@Input() disabled = false;
```

```html
<button [disabled]="disabled">{{ label }}</button>
```

#### Usage:

```html
<app-button label="Save" [disabled]="isSaving"></app-button>
```

This makes the button reusable in different situations like **Save**, **Submit**, or **Delete**.

---

### 4. Using `@Output()` for Communication

I learned that reusable components should not decide what happens on click.
Instead, they should **emit events** and let the parent handle the logic.

```ts
@Output() clicked = new EventEmitter<void>();

onClick() {
  this.clicked.emit();
}
```

```html
<app-button (clicked)="handleSave()"></app-button>
```

This keeps the component clean and flexible.

---

### 5. Shared Module Pattern

I learned how to organize reusable components using a **Shared Module**.

#### Why Shared Module?

* Central place for common components
* Easy to import and reuse across the app
* Improves project structure

#### Folder Structure Used:

```
src/app/shared/
├─ components/
│  ├─ button/
│  ├─ card/
└─ shared.module.ts
```

#### Shared Module Implementation:

```ts
@NgModule({
  declarations: [ButtonComponent, CardComponent],
  exports: [ButtonComponent, CardComponent],
})
export class SharedModule {}
```

Any feature module can now use these components by importing `SharedModule`.

---

### 6. Styling Reusable Components

I learned best practices for styling shared components:

* Keep CSS minimal and clean
* Avoid fixed margins or layout assumptions
* Use theme colors and consistent classes
* Make visual styles configurable (size, variant, color)

This ensures components fit well in different layouts.

---

## Best Practices I Followed

* Built small, single-purpose components
* Used Inputs and Outputs only
* Avoided business logic inside UI components
* Made components configurable
* Documented usage clearly

---

## Angular CLI Commands Used

```bash
ng g c my-button
ng g m shared
ng serve
ng build --configuration production
ng test
```

---
## Database Setup & Team Workflow

This project uses **PostgreSQL via Docker** for local development. Each team member runs their own PostgreSQL container using the shared `docker-compose.yml`, ensuring a consistent database schema while keeping data isolated per developer.

Database structure is shared through migrations, while environment variables are managed using `.env.example`. This approach enables reliable local development and smooth collaboration without sharing sensitive credentials or local data.

Working with Angular Forms

This module introduces Angular Forms and explains how Angular handles user input in a structured and predictable way. It covers both Template-Driven Forms and Reactive Forms, showing how forms act as state managers that connect user input with application logic. The lesson focuses on building reliable, maintainable, and scalable forms for real-world features like login, registration, and dashboards.

Here is a **short, clean, and professional README** you can use directly 👇

---

### Angular Form Validation and Error Handling

This lesson demonstrates how to build user-friendly and reliable Angular forms using proper validation and clear error handling. It covers both template-driven and reactive forms, showing how to prevent invalid submissions, display meaningful error messages, and guide users with visual feedback.

By completing this module, you will understand how to apply validation rules, manage form state safely, and create forms that provide a clean and professional user experience.

---

# Angular Services for State and Data Management

## What I Learned Today

Today, I learned about the importance and usage of Angular services for managing state and data in scalable applications. Here are the key concepts and takeaways:

### 1. Why Angular Services Exist
- Components should focus on displaying UI and handling user interactions, not managing global state or business logic.
- Services centralize logic, share data across components, persist state, and simplify testing and maintenance.

### 2. What Is an Angular Service
- An Angular service is a TypeScript class that holds data or logic and can be injected into multiple components.
- Services are usually singletons (one shared instance across the app).

### 3. Dependency Injection
- Angular automatically creates and provides service instances using dependency injection.
- This enables shared state, loose coupling, and easier testing.

### 4. Using Services for State Management
- Services can store state that survives route changes and component re-renders.
- Multiple components can access and update the same data via a service.

### 5. Sharing Data Between Components
- Services allow different components to share and update data without input chaining or event overuse.

### 6. Services for API and Data Fetching
- Services are the correct place to call backend APIs, handle HTTP requests, and transform response data.
- Components subscribe to service methods and display results.

### 7. Handling Errors in Services
- Services should handle API errors and return clean responses, keeping components simple and resilient.

### 8. Best Practices
- Keep services focused on one responsibility.
- Avoid UI logic in services.
- Use services for shared state and centralized error handling.

### 9. Real-World Example
- A ProfileService can store user data, sync with the backend, and keep the UI consistent across components.

---

## What I Implemented Today

- Understood and applied the concept of Angular services and dependency injection.
- Used services to manage shared state and data in the application.
- Refactored logic out of components and into services for better maintainability.
- Ensured that multiple components could access and update shared data using a singleton service.
- Used services to fetch data from APIs and handle errors centrally.
- Improved the structure and scalability of the Angular application by following best practices for service usage.

---

## Summary

Today, I learned how Angular services act as single sources of truth for data and state, enabling clean, maintainable, and scalable applications. I implemented these concepts in my project, refactoring code to use services for state management, data fetching, and business logic, and experienced firsthand the benefits of this approach.
# Structuring Multi-Page Navigation Using Angular Router

As applications grow beyond a single screen, users need to move between pages, views, and workflows smoothly. Login pages, dashboards, profiles, settings, and detail views all require clear navigation and predictable flows.

Angular solves this using the Angular Router, which lets you define routes, map them to components, and control how users move through your app.

By the end of this guide, you will be able to build multi-page Angular applications with clean route configuration and well-structured navigation flows.

## Understanding Angular Router

The Angular Router is a powerful navigation system that enables single-page application (SPA) behavior. Instead of loading entirely new HTML pages from the server, Angular Router dynamically loads different components based on the URL, creating a seamless user experience.

### Key Concepts

**Routes**: Routes define the mapping between URLs and components. Each route tells Angular which component to display when a specific URL is accessed.

**Router Outlet**: The router outlet is a directive that acts as a placeholder where Angular inserts the component that matches the current route. Think of it as a container that swaps out content based on navigation.

**Navigation**: Navigation can happen in two ways - declaratively through router links in templates, or programmatically through the Router service in TypeScript components.

**Route Configuration**: Routes are typically defined in a separate routes file, keeping navigation logic organized and maintainable.

## Setting Up Routes

### Step 1: Create a Routes Configuration File

Create a routes configuration file in your app directory. This file exports an array of route definitions that Angular will use to match URLs to components.

Each route object contains:
- A path property that defines the URL segment
- A component property that specifies which component to load
- Optional properties like redirects, guards, and data

### Step 2: Configure the Router in Your App

In your main application component, import the RouterOutlet directive and place it in your template where you want routed components to appear. The router outlet serves as the insertion point for components based on the current route.

### Step 3: Import RouterModule or Use Standalone Router

If you're using standalone components (which is the modern approach), you'll need to provide the router configuration when bootstrapping your application. This typically happens in your main application bootstrap file where you configure the application providers.

## Defining Routes

### Basic Route Structure

Routes follow a hierarchical structure. The root route typically maps to your home or landing page component. Additional routes represent different pages or views in your application.

### Route Paths

Route paths can be:
- Empty string for the root/home route
- Static paths like 'about' or 'contact'
- Dynamic paths with parameters like 'product/:id'
- Wildcard paths for 404 pages

### Component Mapping

Each route must specify which component should be rendered when that route is active. This creates a clear connection between URLs and the user interface.

## Navigation Methods

### Declarative Navigation with Router Links

In your templates, use router link directives to create navigation links. These directives automatically handle navigation without requiring JavaScript event handlers. Router links can be applied to anchor tags, buttons, or any clickable element.

Router links support:
- Absolute paths starting with a forward slash
- Relative paths for nested navigation
- Query parameters and fragments
- Active route styling

### Programmatic Navigation

In your component TypeScript files, inject the Router service to navigate programmatically. This is useful when navigation needs to happen based on user actions, form submissions, or conditional logic.

The Router service provides methods to:
- Navigate to specific routes
- Navigate with query parameters
- Navigate with state data
- Handle navigation errors
- Check current route information

### Navigation Guards

Navigation guards allow you to control route access. You can:
- Prevent navigation to certain routes
- Redirect users based on authentication status
- Load data before activating a route
- Confirm navigation before leaving a page

## Route Configuration Best Practices

### Organizing Routes

Keep your route configuration clean and organized:
- Group related routes together
- Use descriptive path names
- Consider route hierarchy for nested views
- Document complex route structures

### Route Data and Metadata

Routes can carry additional data that components can access. This is useful for:
- Page titles
- Breadcrumb information
- Permission requirements
- Custom configuration

### Lazy Loading

For larger applications, implement lazy loading for routes. This means components are only loaded when their route is accessed, improving initial load times and application performance.

## Navigation Flows

### Home to Detail Pages

Create flows where users navigate from a list or gallery view to detailed views. This typically involves:
- A list component showing multiple items
- Click handlers that navigate with item IDs
- Detail components that receive and display item information

### Form Submissions

After form submissions, navigate users to appropriate pages:
- Success pages after successful submissions
- Confirmation pages for important actions
- Return to previous pages on cancellation

### Authentication Flows

Implement authentication-based navigation:
- Redirect unauthenticated users to login
- Redirect authenticated users away from login
- Protect routes that require authentication
- Handle session expiration gracefully

### Cross-Page Section Navigation

For single-page applications with sections, implement smart navigation that:
- Scrolls to sections when on the same page
- Navigates to the page first, then scrolls when coming from other pages
- Handles browser back and forward buttons correctly

## Common Navigation Patterns

### Navigation Bar

Create a persistent navigation bar that:
- Highlights the active route
- Works on both desktop and mobile
- Handles menu toggling on mobile devices
- Maintains state across route changes

### Breadcrumbs

Implement breadcrumb navigation for deep hierarchies:
- Show current location in the application
- Allow quick navigation to parent pages
- Update dynamically based on route

### Tab Navigation

Use router links for tab interfaces:
- Each tab represents a different route
- Active tab styling based on current route
- Smooth transitions between tabs

## Handling Route Parameters

### Reading Route Parameters

Components can access route parameters to:
- Load specific data based on IDs
- Filter content based on query parameters
- Display user-specific information

### Updating Route Parameters

Programmatically update route parameters to:
- Reflect filter changes in the URL
- Enable bookmarkable filtered views
- Support browser back/forward navigation

## Error Handling

### 404 Pages

Create a wildcard route that catches unmatched URLs and displays a user-friendly 404 page. This improves user experience when users navigate to non-existent routes.

### Navigation Errors

Handle navigation errors gracefully:
- Display error messages when navigation fails
- Provide fallback navigation options
- Log errors for debugging

## Testing Navigation

### Testing Route Configuration

Verify that:
- All routes are properly configured
- Components load correctly for each route
- Route parameters are passed correctly

### Testing Navigation Actions

Test that:
- Router links navigate to correct routes
- Programmatic navigation works as expected
- Navigation guards function properly
- Error cases are handled correctly

## Performance Considerations

### Route Preloading

Configure route preloading strategies to:
- Improve perceived performance
- Balance between speed and bandwidth
- Preload critical routes

### Route Data Loading

Optimize data loading for routes:
- Load data after route activation
- Show loading states during data fetching
- Cache route data when appropriate

## Best Practices Summary

1. **Keep Routes Organized**: Maintain a clear, logical structure in your routes configuration file.

2. **Use Descriptive Paths**: Choose URL paths that are meaningful and user-friendly.

3. **Implement Guards**: Protect routes that require authentication or specific permissions.

4. **Handle Errors**: Always provide fallback routes and error handling for navigation failures.

5. **Optimize Loading**: Use lazy loading for routes that aren't immediately needed.

6. **Test Navigation**: Ensure all navigation paths work correctly and handle edge cases.

7. **Maintain State**: Consider how route changes affect component state and user data.

8. **Mobile Considerations**: Ensure navigation works well on mobile devices with appropriate menu handling.

9. **Accessibility**: Use proper semantic HTML and ARIA attributes for navigation elements.

10. **User Feedback**: Provide visual feedback during navigation, such as loading indicators or active route highlighting.

By following these principles and understanding how Angular Router works, you can create intuitive, maintainable navigation systems that enhance user experience and keep your application organized.

Calling Rust API Endpoints from Angular Using HttpClient

In this sprint, we bring everything together by connecting the Angular frontend with the Rust backend. After building both sides separately, the key step in full-stack development is enabling communication between them.

This lesson focuses on how Angular uses HttpClient to send and receive data from Rust API endpoints, allowing you to build complete, real-world application flows.


A modular Angular frontend

A secure Rust backend with REST APIs

Middleware configuration and CORS handling

Authentication and database integration

Now, it’s time to make the frontend and backend talk to each other.
