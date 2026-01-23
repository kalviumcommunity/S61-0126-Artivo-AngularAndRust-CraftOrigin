use sqlx::{Pool};
use uuid::Uuid;
use crate::models::artwork::{CreateArtworkRequest, UpdateArtworkRequest, ArtworkResponse};

#[derive(Debug)]
pub enum ServiceError {
    NotFound,
    BadRequest(String),
    Db(sqlx::Error),
}

impl From<sqlx::Error> for ServiceError {
    fn from(e: sqlx::Error) -> Self {
        ServiceError::Db(e)
    }
}

pub async fn create_artwork(pool: &Pool<sqlx::Postgres>, req: CreateArtworkRequest) -> Result<ArtworkResponse, ServiceError> {
    let row = sqlx::query_as!(
        ArtworkResponse,
        r#"
        INSERT INTO artworks
        (id, artist_id, title, description, category, price, quantity_available, authenticity_ref, active, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, TRUE, now(), now())
        RETURNING id, artist_id, title, description, category, price, quantity_available, authenticity_ref, active, created_at, updated_at
        "#,
        req.artist_id,
        req.title,
        req.description,
        req.category,
        req.price,
        req.quantity_available,
        req.authenticity_ref
    )
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn list_artworks(pool: &Pool<sqlx::Postgres>) -> Result<Vec<ArtworkResponse>, ServiceError> {
    let rows = sqlx::query_as!(
        ArtworkResponse,
        r#"
        SELECT id, artist_id, title, description, category, price, quantity_available, authenticity_ref, active, created_at, updated_at
        FROM artworks
        WHERE active = TRUE
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_artwork(pool: &Pool<sqlx::Postgres>, id: Uuid) -> Result<ArtworkResponse, ServiceError> {
    let row = sqlx::query_as!(
        ArtworkResponse,
        r#"
        SELECT id, artist_id, title, description, category, price, quantity_available, authenticity_ref, active, created_at, updated_at
        FROM artworks
        WHERE id = $1 AND active = TRUE
        "#,
        id
    )
    .fetch_optional(pool)
    .await?;
    match row {
        Some(r) => Ok(r),
        None => Err(ServiceError::NotFound),
    }
}

pub async fn update_artwork(pool: &Pool<sqlx::Postgres>, id: Uuid, req: UpdateArtworkRequest) -> Result<ArtworkResponse, ServiceError> {
    let row = sqlx::query_as!(
        ArtworkResponse,
        r#"
        UPDATE artworks
        SET title = $1,
            description = $2,
            category = $3,
            price = $4,
            quantity_available = $5,
            authenticity_ref = $6,
            updated_at = now()
        WHERE id = $7 AND active = TRUE
        RETURNING id, artist_id, title, description, category, price, quantity_available, authenticity_ref, active, created_at, updated_at
        "#,
        req.title,
        req.description,
        req.category,
        req.price,
        req.quantity_available,
        req.authenticity_ref,
        id
    )
    .fetch_optional(pool)
    .await?;
    match row {
        Some(r) => Ok(r),
        None => Err(ServiceError::NotFound),
    }
}

pub async fn soft_delete_artwork(pool: &Pool<sqlx::Postgres>, id: Uuid) -> Result<(), ServiceError> {
    let res: sqlx::postgres::PgQueryResult = sqlx::query!(
        r#"
        UPDATE artworks
        SET active = FALSE,
            updated_at = now()
        WHERE id = $1 AND active = TRUE
        "#,
        id
    )
    .execute(pool)
    .await?;

    if res.rows_affected() == 0 {
        Err(ServiceError::NotFound)
    } else {
        Ok(())
    }
}
