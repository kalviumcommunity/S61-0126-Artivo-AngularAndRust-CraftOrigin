use sqlx::postgres::PgPoolOptions;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, SaltString
    },
    Argon2
};
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .connect(&database_url)
        .await?;

    println!("Connected to database.");

    // Fetch all users
    let users = sqlx::query!("SELECT id, email, password_hash FROM users")
        .fetch_all(&pool)
        .await?;

    println!("Found {} users.", users.len());

    let argon2 = Argon2::default();

    for user in users {
        let is_valid = PasswordHash::new(&user.password_hash).is_ok();
        
        if !is_valid {
            println!("User {} ({}) has invalid password hash: '{}'. Updating to 'password'.", user.email, user.id, user.password_hash);
            
            let salt = SaltString::generate(&mut OsRng);
            let new_hash = argon2.hash_password(b"password", &salt)
                .map_err(|e| format!("Hashing failed: {}", e))?
                .to_string();
            
            sqlx::query!("UPDATE users SET password_hash = $1 WHERE id = $2", new_hash, user.id)
                .execute(&pool)
                .await?;
                
            println!("Updated password for {}", user.email);
        } else {
            println!("User {} has valid hash.", user.email);
        }
    }

    println!("Done.");
    Ok(())
}
