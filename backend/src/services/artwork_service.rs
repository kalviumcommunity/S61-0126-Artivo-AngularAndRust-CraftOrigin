use sqlx::{Pool, QueryBuilder};
use uuid::Uuid;
use crate::models::artwork::{CreateArtworkRequest, UpdateArtworkRequest, ArtworkResponse, ArtworkListQuery};

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

pub async fn list_artworks(pool: &Pool<sqlx::Postgres>, q: ArtworkListQuery) -> Result<Vec<ArtworkResponse>, ServiceError> {
    let limit = q.limit.unwrap_or(10).max(1);
    let page = q.page.unwrap_or(1).max(1);
    let offset = (page - 1) * limit;

    let mut builder = QueryBuilder::new(
        "SELECT id, artist_id, title, description, category, price, quantity_available, authenticity_ref, active, created_at, updated_at FROM artworks WHERE active = TRUE"
    );

    if let Some(category) = q.category {
        builder.push(" AND category = ").push_bind(category);
    }
    if let Some(artist_id) = q.artist_id {
        builder.push(" AND artist_id = ").push_bind(artist_id);
    }
    if let Some(min_price) = q.min_price {
        builder.push(" AND price >= ").push_bind(min_price);
    }
    if let Some(max_price) = q.max_price {
        builder.push(" AND price <= ").push_bind(max_price);
    }

    builder.push(" ORDER BY created_at DESC");
    builder.push(" LIMIT ").push_bind(limit);
    builder.push(" OFFSET ").push_bind(offset);

    let query = builder.build_query_as::<ArtworkResponse>();
    let rows = query.fetch_all(pool).await?;
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
