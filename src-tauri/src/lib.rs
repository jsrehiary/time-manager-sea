pub mod commands;
pub mod db;
pub mod entities;

use db::AppState;
use tauri::Manager;

#[tauri::command]
async fn initialize_database(_app: tauri::AppHandle, state: tauri::State<'_, AppState>) -> Result<(), String> {
    // Load .env file
    dotenvy::dotenv().ok();
    
    // Get DATABASE_URL from environment
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite://db.sqlite?mode=rwc".to_string());
    
    db::init_db(&state, &database_url).await.map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .setup(|app| {
            let app_handle = app.handle().clone();
            let state = app.state::<AppState>();
            
            tauri::async_runtime::block_on(async move {
                initialize_database(app_handle, state)
                    .await
                    .expect("Failed to initialize database");
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            initialize_database,
            // Board commands
            commands::board::get_all_boards,
            commands::board::get_board_by_id,
            commands::board::create_board,
            commands::board::update_board,
            commands::board::delete_board,
            // Column commands
            commands::column::get_columns_by_board,
            commands::column::get_column_by_id,
            commands::column::create_column,
            commands::column::update_column,
            commands::column::delete_column,
            // Task commands
            commands::task::get_tasks_by_column,
            commands::task::get_task_by_id,
            commands::task::create_task,
            commands::task::update_task,
            commands::task::delete_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
