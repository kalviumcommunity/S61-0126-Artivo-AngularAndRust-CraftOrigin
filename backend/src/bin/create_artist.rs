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

    let argon2 = Argon2::default();
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = argon2.hash_password(b"password", &salt)
        .map_err(|e| format!("Hashing failed: {}", e))?
        .to_string();

    let user = sqlx::query!(
        r#"
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email)
        DO UPDATE SET name = $1, password_hash = $3, role = $4
        RETURNING id
        "#,
        "Artist User",
        "artist@example.com",
        password_hash,
        "ARTIST"
    )
    .fetch_one(&pool)
    .await?;

    let artist = sqlx::query!(
        r#"
        INSERT INTO artists (id, user_id, tribe_name, region, bio, verification_status, active)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, TRUE)
        ON CONFLICT (user_id)
        DO UPDATE SET tribe_name = $2, region = $3, bio = $4, verification_status = $5, active = TRUE, updated_at = now()
        RETURNING id
        "#,
        user.id,
        "Demo Tribe",
        "Demo Region",
        "Sample artist account for local testing.",
        "VERIFIED"
    )
    .fetch_one(&pool)
    .await?;

    println!("Artist user created/updated:");
    println!("  Email: artist@example.com");
    println!("  Password: password");
    println!("  User ID: {}", user.id);
    println!("  Artist ID: {}", artist.id);

    Ok(())
}
