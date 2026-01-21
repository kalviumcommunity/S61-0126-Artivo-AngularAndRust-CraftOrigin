use sqlx::Pool;

pub async fn ensure_schema(pool: &Pool<sqlx::Postgres>) {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )",
    )
    .execute(pool)
    .await
    .expect("Failed to ensure users table");
}
