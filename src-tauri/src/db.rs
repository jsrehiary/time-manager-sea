use sea_orm::{Database, DatabaseConnection, DbErr};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub db: Arc<Mutex<Option<DatabaseConnection>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: Arc::new(Mutex::new(None)),
        }
    }
}

pub async fn establish_connection(database_url: &str) -> Result<DatabaseConnection, DbErr> {
    Database::connect(database_url).await
}

pub async fn init_db(state: &AppState, database_url: &str) -> Result<(), DbErr> {
    let conn = establish_connection(database_url).await?;
    let mut db = state.db.lock().await;
    *db = Some(conn);
    Ok(())
}
