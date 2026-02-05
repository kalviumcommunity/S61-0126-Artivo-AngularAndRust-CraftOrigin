use sqlx::postgres::PgPoolOptions;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHasher, SaltString
    },
    Argon2
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("Connected to database.");

    // Hash the password
    let argon2 = Argon2::default();
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = argon2.hash_password(b"password", &salt)
        .map_err(|e| format!("Hashing failed: {}", e))?
        .to_string();

    // Insert admin user
    let result = sqlx::query!(
        r#"
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) 
        DO UPDATE SET password_hash = $3, role = $4
        RETURNING id
        "#,
        "Admin User",
        "admin@example.com",
        password_hash,
        "ADMIN"
    )
    .fetch_one(&pool)
    .await?;

    println!("Admin user created/updated:");
    println!("  Email: admin@example.com");
    println!("  Password: password");
    println!("  ID: {}", result.id);

    Ok(())
}
