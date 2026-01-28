use actix_multipart::Multipart;
use actix_web::{web, HttpResponse, Error};
use futures::{StreamExt, TryStreamExt};
use std::io::Write;
use uuid::Uuid;
use std::path::Path;

pub async fn upload_image(mut payload: Multipart) -> Result<HttpResponse, Error> {
    let mut uploaded_file_url = String::new();

    // Iterate over multipart stream
    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field.content_disposition();
        let filename = content_type.get_filename();
        
        if let Some(fname) = filename {
            // Validate file extension
            let parts: Vec<&str> = fname.split('.').collect();
            let ext = if parts.len() > 1 { parts.last().unwrap() } else { "" };
            
            if !["jpg", "jpeg", "png", "gif", "webp"].contains(&ext.to_lowercase().as_str()) {
                continue; // Skip non-image files
            }

            // Generate unique filename
            let new_filename = format!("{}.{}", Uuid::new_v4(), ext);
            let filepath = format!("./static/uploads/{}", new_filename);
            
            // Create path if it doesn't exist (handled in main, but safety check)
            if let Some(parent) = Path::new(&filepath).parent() {
                std::fs::create_dir_all(parent)?;
            }

            // File operations
            let mut f = web::block(move || std::fs::File::create(filepath))
                .await??;

            // Field in turn is stream of *Bytes* object
            while let Some(chunk) = field.next().await {
                let data = chunk?;
                // filesystem operations are blocking, we have to use web::block
                f = web::block(move || f.write_all(&data).map(|_| f))
                    .await??;
            }
            
            // Assuming localhost:8080 for now, but this should be configurable
            // In production, this would be the CDN URL or S3 URL
            uploaded_file_url = format!("/static/uploads/{}", new_filename);
        }
    }

    if uploaded_file_url.is_empty() {
        Ok(HttpResponse::BadRequest().body("No valid image file found"))
    } else {
        Ok(HttpResponse::Ok().json(serde_json::json!({ "url": uploaded_file_url })))
    }
}
