use crate::db::AppState;
use crate::entities::{board, prelude::*};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct BoardResponse {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateBoardRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBoardRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}

impl From<board::Model> for BoardResponse {
    fn from(model: board::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            description: model.description,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}

#[tauri::command]
pub async fn get_all_boards(state: State<'_, AppState>) -> Result<Vec<BoardResponse>, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let boards = Board::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(boards.into_iter().map(BoardResponse::from).collect())
}

#[tauri::command]
pub async fn get_board_by_id(
    state: State<'_, AppState>,
    id: i32,
) -> Result<BoardResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let board = Board::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Board with id {} not found", id))?;

    Ok(BoardResponse::from(board))
}

#[tauri::command]
pub async fn create_board(
    state: State<'_, AppState>,
    request: CreateBoardRequest,
) -> Result<BoardResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let now = chrono::Utc::now();
    let now_fixed = now.with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());

    let new_board = board::ActiveModel {
        name: Set(request.name),
        description: Set(request.description),
        created_at: Set(now_fixed),
        updated_at: Set(now_fixed),
        ..Default::default()
    };

    let board = new_board.insert(db).await.map_err(|e| e.to_string())?;

    Ok(BoardResponse::from(board))
}

#[tauri::command]
pub async fn update_board(
    state: State<'_, AppState>,
    id: i32,
    request: UpdateBoardRequest,
) -> Result<BoardResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let board = Board::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Board with id {} not found", id))?;

    let now = chrono::Utc::now();
    let now_fixed = now.with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());

    let mut board: board::ActiveModel = board.into();

    if let Some(name) = request.name {
        board.name = Set(name);
    }
    if request.description.is_some() {
        board.description = Set(request.description);
    }
    board.updated_at = Set(now_fixed);

    let updated_board = board.update(db).await.map_err(|e| e.to_string())?;

    Ok(BoardResponse::from(updated_board))
}

#[tauri::command]
pub async fn delete_board(state: State<'_, AppState>, id: i32) -> Result<(), String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let board = Board::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Board with id {} not found", id))?;

    let board: board::ActiveModel = board.into();
    board.delete(db).await.map_err(|e| e.to_string())?;

    Ok(())
}
