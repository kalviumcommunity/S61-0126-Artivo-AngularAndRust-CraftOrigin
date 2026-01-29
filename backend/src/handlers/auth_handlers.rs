use actix_web::{web, HttpResponse, Responder};
use sqlx::{Pool, Row};
use uuid::Uuid;
use crate::models::user::{AuthRequest, AuthResponse, UserResponse, Claims};
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono::{Utc, Duration};
use std::env;

/// Generate a real JWT token using jsonwebtoken
fn generate_token(user_id: Uuid, _email: &str, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret_key".to_string());
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp: expiration,
        role: role.to_string(),
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
}

/// Register a new user
pub async fn register(
    payload: web::Json<AuthRequest>,
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    // Validate required fields
    if payload.email.is_empty() || payload.password.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Email and password are required"
        }));
    }

    if payload.password.len() < 6 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Password must be at least 6 characters long"
        }));
    }

    let name = payload.name.clone().unwrap_or_else(|| "User".to_string());
    let email = payload.email.clone().to_lowercase().trim().to_string();

    if !email.contains('@') {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Invalid email format"
        }));
    }

    // Check if user exists
    let user_exists = sqlx::query("SELECT id FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(pool.get_ref())
        .await;

    match user_exists {
        Ok(Some(_)) => {
            return HttpResponse::Conflict().json(serde_json::json!({
                "message": "Email already registered"
            }));
        }
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Registration failed"
            }));
        }
        Ok(None) => {}
    }

    // Hash password
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = match argon2.hash_password(payload.password.as_bytes(), &salt) {
        Ok(hash) => hash.to_string(),
        Err(e) => {
            eprintln!("Hashing error: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Registration failed"
            }));
        }
    };

    // Insert user
    match sqlx::query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'BUYER') RETURNING id, name, email, role")
        .bind(&name)
        .bind(&email)
        .bind(&password_hash)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(row) => {
            let id: Uuid = row.get("id");
            let name: String = row.get("name");
            let email: String = row.get("email");
            let role: String = row.get("role");

            let user = UserResponse { id, name, email: email.clone() };
            
            match generate_token(id, &email, &role) {
                Ok(token) => HttpResponse::Created().json(AuthResponse {
                    token,
                    user,
                    message: "Registration successful".into(),
                }),
                Err(e) => {
                    eprintln!("Token generation error: {:?}", e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "message": "Registration successful but token generation failed"
                    }))
                }
            }
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
pub async fn login(
    payload: web::Json<AuthRequest>,
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    if payload.email.is_empty() || payload.password.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "message": "Email and password are required"
        }));
    }

    let email = payload.email.clone().to_lowercase().trim().to_string();

    match sqlx::query("SELECT id, name, email, password_hash, role FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(row)) => {
            let password_hash: String = row.get("password_hash");
            let parsed_hash = match PasswordHash::new(&password_hash) {
                Ok(h) => h,
                Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({"message": "Login failed"}))
            };

            if Argon2::default().verify_password(payload.password.as_bytes(), &parsed_hash).is_ok() {
                let id: Uuid = row.get("id");
                let name: String = row.get("name");
                let role: String = row.get("role");
                
                let user = UserResponse { id, name, email: email.clone() };

                match generate_token(id, &email, &role) {
                    Ok(token) => HttpResponse::Ok().json(AuthResponse {
                        token,
                        user,
                        message: "Login successful".into(),
                    }),
                    Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
                        "message": "Login failed"
                    }))
                }
            } else {
                HttpResponse::Unauthorized().json(serde_json::json!({
                    "message": "Invalid email or password"
                }))
            }
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "message": "Invalid email or password"
        })),
        Err(e) => {
            eprintln!("Login error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "message": "Login failed"
            }))
        }
    }
}
