use actix_web::{get, App, HttpServer, Responder};

#[get("/")]
async fn hello() -> impl Responder {
    "Rust backend is running"
}
#[get("/health")]
async fn health() -> impl Responder {
    "Rust backend is running healthy"
}
#[tokio::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(hello).service(health))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}