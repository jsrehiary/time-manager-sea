# Time Manager Sea - API Documentation

## Backend Setup

The backend is built with Tauri + Rust + SeaORM and provides a complete CRUD API for managing boards, columns, and tasks.

### Database Structure

- **Board**: Top-level container for organizing tasks
- **Column**: Belongs to a board, contains tasks (like "To Do", "In Progress", "Done")
- **Task**: Belongs to a column, represents individual work items

### Available Tauri Commands

#### Board Commands
- `get_all_boards()` - Get all boards
- `get_board_by_id(id)` - Get a specific board
- `create_board(request)` - Create a new board
- `update_board(id, request)` - Update a board
- `delete_board(id)` - Delete a board

#### Column Commands
- `get_columns_by_board(board_id)` - Get all columns for a board
- `get_column_by_id(id)` - Get a specific column
- `create_column(request)` - Create a new column
- `update_column(id, request)` - Update a column
- `delete_column(id)` - Delete a column

#### Task Commands
- `get_tasks_by_column(column_id)` - Get all tasks for a column
- `get_task_by_id(id)` - Get a specific task
- `create_task(request)` - Create a new task
- `update_task(id, request)` - Update a task
- `delete_task(id)` - Delete a task

## Frontend Usage

Import the API functions from `src/lib/api.ts`:

```typescript
import { boardApi, columnApi, taskApi } from '@/lib/api';

// Example: Create a new board
const board = await boardApi.create("My Project", "Project description");

// Example: Create columns for the board
const todoColumn = await columnApi.create(board.id, "To Do", 0);
const inProgressColumn = await columnApi.create(board.id, "In Progress", 1);
const doneColumn = await columnApi.create(board.id, "Done", 2);

// Example: Create a task
const task = await taskApi.create(
  todoColumn.id,
  "Implement user authentication",
  0,
  "Add JWT-based authentication system",
  "high",
  "2025-12-01T00:00:00Z"
);

// Example: Move task to another column
await taskApi.update(task.id, { columnId: inProgressColumn.id });

// Example: Get all boards
const boards = await boardApi.getAll();

// Example: Get columns for a board
const columns = await columnApi.getByBoard(board.id);

// Example: Get tasks for a column
const tasks = await taskApi.getByColumn(todoColumn.id);
```

### React Component Example

```tsx
import { useEffect, useState } from 'react';
import { boardApi, columnApi, taskApi, Board, Column, Task } from '@/lib/api';

export function KanbanBoard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({});

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      loadColumns(selectedBoard.id);
    }
  }, [selectedBoard]);

  const loadBoards = async () => {
    const data = await boardApi.getAll();
    setBoards(data);
    if (data.length > 0) {
      setSelectedBoard(data[0]);
    }
  };

  const loadColumns = async (boardId: number) => {
    const cols = await columnApi.getByBoard(boardId);
    setColumns(cols);
    
    // Load tasks for each column
    const tasksMap: Record<number, Task[]> = {};
    for (const col of cols) {
      tasksMap[col.id] = await taskApi.getByColumn(col.id);
    }
    setTasksByColumn(tasksMap);
  };

  const createBoard = async (name: string) => {
    const newBoard = await boardApi.create(name);
    setBoards([...boards, newBoard]);
  };

  const createTask = async (columnId: number, title: string) => {
    const tasks = tasksByColumn[columnId] || [];
    const newTask = await taskApi.create(columnId, title, tasks.length);
    setTasksByColumn({
      ...tasksByColumn,
      [columnId]: [...tasks, newTask],
    });
  };

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

## Running the Application

1. Build the Rust backend:
```bash
cd src-tauri
cargo build
```

2. Run the development server:
```bash
npm run tauri dev
```

The database will be automatically initialized on first run at:
- Linux: `~/.local/share/time-manager-sea/time_manager.db`
- macOS: `~/Library/Application Support/time-manager-sea/time_manager.db`
- Windows: `C:\Users\{username}\AppData\Roaming\time-manager-sea\time_manager.db`
