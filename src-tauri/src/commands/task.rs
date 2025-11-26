use crate::db::AppState;
use crate::entities::{prelude::*, task};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskResponse {
    pub id: i32,
    pub column_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub position: i32,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaskRequest {
    pub column_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub position: i32,
    pub priority: Option<String>,
    pub due_date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTaskRequest {
    pub column_id: Option<i32>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub position: Option<i32>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
}

impl From<task::Model> for TaskResponse {
    fn from(model: task::Model) -> Self {
        Self {
            id: model.id,
            column_id: model.column_id,
            title: model.title,
            description: model.description,
            position: model.position,
            priority: model.priority,
            due_date: model.due_date.map(|d| d.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}

#[tauri::command]
pub async fn get_tasks_by_column(
    state: State<'_, AppState>,
    column_id: i32,
) -> Result<Vec<TaskResponse>, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let tasks = Task::find()
        .filter(task::Column::ColumnId.eq(column_id))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(tasks.into_iter().map(TaskResponse::from).collect())
}

#[tauri::command]
pub async fn get_task_by_id(state: State<'_, AppState>, id: i32) -> Result<TaskResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let task = Task::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Task with id {} not found", id))?;

    Ok(TaskResponse::from(task))
}

#[tauri::command]
pub async fn create_task(
    state: State<'_, AppState>,
    request: CreateTaskRequest,
) -> Result<TaskResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let now = chrono::Utc::now();
    let now_fixed = now.with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());

    let due_date = if let Some(due_date_str) = request.due_date {
        Some(
            chrono::DateTime::parse_from_rfc3339(&due_date_str)
                .map_err(|e| format!("Invalid date format: {}", e))?,
        )
    } else {
        None
    };

    let new_task = task::ActiveModel {
        column_id: Set(request.column_id),
        title: Set(request.title),
        description: Set(request.description),
        position: Set(request.position),
        priority: Set(request.priority),
        due_date: Set(due_date),
        created_at: Set(now_fixed),
        updated_at: Set(now_fixed),
        ..Default::default()
    };

    let task = new_task.insert(db).await.map_err(|e| e.to_string())?;

    Ok(TaskResponse::from(task))
}

#[tauri::command]
pub async fn update_task(
    state: State<'_, AppState>,
    id: i32,
    request: UpdateTaskRequest,
) -> Result<TaskResponse, String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let task = Task::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Task with id {} not found", id))?;

    let now = chrono::Utc::now();
    let now_fixed = now.with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());

    let mut task: task::ActiveModel = task.into();

    if let Some(column_id) = request.column_id {
        task.column_id = Set(column_id);
    }
    if let Some(title) = request.title {
        task.title = Set(title);
    }
    if request.description.is_some() {
        task.description = Set(request.description);
    }
    if let Some(position) = request.position {
        task.position = Set(position);
    }
    if request.priority.is_some() {
        task.priority = Set(request.priority);
    }
    if let Some(due_date_str) = request.due_date {
        let due_date = chrono::DateTime::parse_from_rfc3339(&due_date_str)
            .map_err(|e| format!("Invalid date format: {}", e))?;
        task.due_date = Set(Some(due_date));
    }
    task.updated_at = Set(now_fixed);

    let updated_task = task.update(db).await.map_err(|e| e.to_string())?;

    Ok(TaskResponse::from(updated_task))
}

#[tauri::command]
pub async fn delete_task(state: State<'_, AppState>, id: i32) -> Result<(), String> {
    let db = state.db.lock().await;
    let db = db.as_ref().ok_or("Database not initialized")?;

    let task = Task::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Task with id {} not found", id))?;

    let task: task::ActiveModel = task.into();
    task.delete(db).await.map_err(|e| e.to_string())?;

    Ok(())
}
