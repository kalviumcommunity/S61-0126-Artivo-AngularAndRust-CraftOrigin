use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    body::{BoxBody, EitherBody},
    Error, HttpMessage, HttpResponse,
};
use futures::future::{ok, Ready, LocalBoxFuture};
use std::rc::Rc;
use jsonwebtoken::{decode, DecodingKey, Validation};
use crate::models::user::Claims;
use std::env;

pub struct Auth;

impl<S, B> Transform<S, ServiceRequest> for Auth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B, BoxBody>>;
    type Error = Error;
    type Transform = AuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(AuthMiddleware {
            service: Rc::new(service),
        })
    }
}

pub struct AuthMiddleware<S> {
    service: Rc<S>,
}

impl<S, B> Service<ServiceRequest> for AuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B, BoxBody>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, ctx: &mut core::task::Context<'_>) -> core::task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let auth_header = req.headers().get("Authorization");

        if let Some(auth_header) = auth_header {
            if let Ok(auth_str) = auth_header.to_str() {
                if auth_str.starts_with("Bearer ") {
                    let token = &auth_str[7..];
                    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret_key".to_string());
                    
                    match decode::<Claims>(
                        token,
                        &DecodingKey::from_secret(secret.as_bytes()),
                        &Validation::default(),
                    ) {
                        Ok(token_data) => {
                            // Insert claims into extensions so handlers can access them
                            req.extensions_mut().insert(token_data.claims);
                            let fut = self.service.call(req);
                            
                            return Box::pin(async move {
                                let res = fut.await?;
                                Ok(res.map_into_left_body())
                            });
                        }
                        Err(e) => {
                            // Invalid token
                            println!("AuthMiddleware: Invalid token: {:?}", e);
                            return Box::pin(async move {
                                let res = req.into_response(HttpResponse::Unauthorized().finish());
                                Ok(res.map_into_right_body())
                            });
                        }
                    }
                }
            }
        } else {
             println!("AuthMiddleware: No Authorization header found for path: {}", req.path());
        }

        Box::pin(async move {
            let res = req.into_response(HttpResponse::Unauthorized().finish());
            Ok(res.map_into_right_body())
        })
    }
}
