FROM rust:1-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations
COPY .sqlx ./.sqlx
ENV SQLX_OFFLINE=1
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/backend /app/backend
EXPOSE 8080
ENV RUST_BACKTRACE=1
CMD ["/app/backend"]
