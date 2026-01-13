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
