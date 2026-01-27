use actix_web::{web, HttpResponse, Responder};
use sqlx::{Pool, Row};
use uuid::Uuid;
use crate::models::user::{AuthRequest, AuthResponse, UserResponse};

/// Generate a simple JWT-like token for authentication
/// In production, use a proper JWT library like `jsonwebtoken`
fn generate_token() -> String {
    format!("jwt-token-{}", chrono::Utc::now().timestamp_millis())
}

/// Register a new user
/// POST /api/auth/register
/// 
/// Request body:
/// ```json
/// {
///   "name": "John Doe",
///   "email": "john@example.com",
///   "password": "password123"
/// }
/// ```
/// 
/// Response (201 Created):
/// ```json
/// {
///   "token": "jwt-token-...",
///   "user": {
///     "id": "uuid",
///     "name": "John Doe",
///     "email": "john@example.com"
///   },
///   "message": "Registration successful"
/// }
/// ```
pub async fn register(
    payload: web::Json<AuthRequest>,
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    // Validate required fields
    if payload.email.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Email is required"
        }));
    }

    if payload.password.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Password is required"
        }));
    }

    // Basic password validation (minimum length)
    if payload.password.len() < 6 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Password must be at least 6 characters long"
        }));
    }

    let name = payload.name.clone().unwrap_or_else(|| "User".to_string());
    let email = payload.email.clone().to_lowercase().trim().to_string();

    // Validate email format (basic check)
    if !email.contains('@') {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Invalid email format"
        }));
    }

    // Check if user already exists
    match sqlx::query("SELECT id, name, email FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(_)) => {
            return HttpResponse::Conflict().json(serde_json::json!({
                "message": "Email already registered"
            }));
        }
        Ok(None) => {
            // User doesn't exist, proceed with registration
        }
        Err(e) => {
            eprintln!("Database error checking existing user: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Registration failed"
            }));
        }
    }

    // Insert new user into database
    match sqlx::query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email")
        .bind(&name)
        .bind(&email)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(row) => {
            let user = UserResponse {
                id: row.get::<Uuid, _>("id"),
                name: row.get::<String, _>("name"),
                email: row.get::<String, _>("email"),
            };
            
            let resp = AuthResponse {
                token: generate_token(),
                user,
                message: "Registration successful".into(),
            };
            
            HttpResponse::Created().json(resp)
        }
        Err(e) => {
            eprintln!("Registration error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Registration failed"
            }))
        }
    }
}

/// Login an existing user
/// POST /api/auth/login
/// 
/// Request body:
/// ```json
/// {
///   "email": "john@example.com",
///   "password": "password123"
/// }
/// ```
/// 
/// Response (200 OK):
/// ```json
/// {
///   "token": "jwt-token-...",
///   "user": {
///     "id": "uuid",
///     "name": "John Doe",
///     "email": "john@example.com"
///   },
///   "message": "Login successful"
/// }
/// ```
pub async fn login(
    payload: web::Json<AuthRequest>,
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    // Validate required fields
    if payload.email.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Email is required"
        }));
    }

    if payload.password.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Password is required"
        }));
    }

    let email = payload.email.clone().to_lowercase().trim().to_string();

    // Find user by email
    // Note: Password validation is not implemented yet
    // In production, you should hash passwords and compare them here
    match sqlx::query("SELECT id, name, email FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(row)) => {
            let user = UserResponse {
                id: row.get::<Uuid, _>("id"),
                name: row.get::<String, _>("name"),
                email: row.get::<String, _>("email"),
            };
            
            let resp = AuthResponse {
                token: generate_token(),
                user,
                message: "Login successful".into(),
            };
            
            HttpResponse::Ok().json(resp)
        }
        Ok(None) => {
            // User not found - return generic error for security
            HttpResponse::Unauthorized().json(serde_json::json!({
                "message": "Invalid email or password"
            }))
        }
        Err(e) => {
            eprintln!("Login error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Login failed"
            }))
        }
    }
}
