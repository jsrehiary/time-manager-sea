use crate::db::AppState;
use crate::entities::{column, prelude::*};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ColumnResponse {
    pub id: i32,
    pub board_id: i32,
    pub name: String,
    pub position: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateColumnRequest {
    pub board_id: i32,
    pub name: String,
    pub position: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateColumnRequest {
    pub name: Option<String>,
    pub position: Option<i32>,
}

impl From<column::Model> for ColumnResponse {
    fn from(model: column::Model) -> Self {
        Self {
            id: model.id,
            board_id: model.board_id,
            name: model.name,
            position: model.position,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}

#[tauri::command]
pub async fn get_columns_by_board(
    state: State<'_, AppState>,
    board_id: i32,
) -> Result<Vec<ColumnResponse>, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let columns = Column::find()
        .filter(column::Column::BoardId.eq(board_id))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(columns.into_iter().map(ColumnResponse::from).collect())
}

#[tauri::command]
pub async fn get_column_by_id(
    state: State<'_, AppState>,
    id: i32,
) -> Result<ColumnResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let column = Column::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Column with id {} not found", id))?;

    Ok(ColumnResponse::from(column))
}

#[tauri::command]
pub async fn create_column(
    state: State<'_, AppState>,
    request: CreateColumnRequest,
) -> Result<ColumnResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let now = chrono::Utc::now();
    let now_fixed = now.with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());

    let new_column = column::ActiveModel {
        board_id: Set(request.board_id),
        name: Set(request.name),
        position: Set(request.position),
        created_at: Set(now_fixed),
        updated_at: Set(now_fixed),
        ..Default::default()
    };

    let column = new_column.insert(db).await.map_err(|e| e.to_string())?;

    Ok(ColumnResponse::from(column))
}

#[tauri::command]
pub async fn update_column(
    state: State<'_, AppState>,
    id: i32,
    request: UpdateColumnRequest,
) -> Result<ColumnResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let column = Column::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Column with id {} not found", id))?;

    let now = chrono::Utc::now();
    let now_fixed = now.with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());

    let mut column: column::ActiveModel = column.into();

    if let Some(name) = request.name {
        column.name = Set(name);
    }
    if let Some(position) = request.position {
        column.position = Set(position);
    }
    column.updated_at = Set(now_fixed);

    let updated_column = column.update(db).await.map_err(|e| e.to_string())?;

    Ok(ColumnResponse::from(updated_column))
}

#[tauri::command]
pub async fn delete_column(state: State<'_, AppState>, id: i32) -> Result<(), String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let column = Column::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Column with id {} not found", id))?;

    let column: column::ActiveModel = column.into();
    column.delete(db).await.map_err(|e| e.to_string())?;

    Ok(())
}
