import { invoke } from "@tauri-apps/api/core";

// Types
export interface Board {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  priority: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Board API
export const boardApi = {
  getAll: async (): Promise<Board[]> => {
    return await invoke("get_all_boards");
  },

  getById: async (id: number): Promise<Board> => {
    return await invoke("get_board_by_id", { id });
  },

  create: async (name: string, description?: string): Promise<Board> => {
    return await invoke("create_board", {
      request: {
        name,
        description: description || null,
      },
    });
  },

  update: async (
    id: number,
    name?: string,
    description?: string
  ): Promise<Board> => {
    return await invoke("update_board", {
      id,
      request: {
        name: name || null,
        description: description || null,
      },
    });
  },

  delete: async (id: number): Promise<void> => {
    return await invoke("delete_board", { id });
  },
};

// Column API
export const columnApi = {
  getByBoard: async (boardId: number): Promise<Column[]> => {
    return await invoke("get_columns_by_board", { boardId });
  },

  getById: async (id: number): Promise<Column> => {
    return await invoke("get_column_by_id", { id });
  },

  create: async (
    boardId: number,
    name: string,
    position: number
  ): Promise<Column> => {
    return await invoke("create_column", {
      request: {
        board_id: boardId,
        name,
        position,
      },
    });
  },

  update: async (
    id: number,
    name?: string,
    position?: number
  ): Promise<Column> => {
    return await invoke("update_column", {
      id,
      request: {
        name: name || null,
        position: position ?? null,
      },
    });
  },

  delete: async (id: number): Promise<void> => {
    return await invoke("delete_column", { id });
  },
};

// Task API
export const taskApi = {
  getByColumn: async (columnId: number): Promise<Task[]> => {
    return await invoke("get_tasks_by_column", { columnId });
  },

  getById: async (id: number): Promise<Task> => {
    return await invoke("get_task_by_id", { id });
  },

  create: async (
    columnId: number,
    title: string,
    position: number,
    description?: string,
    priority?: string,
    dueDate?: string
  ): Promise<Task> => {
    return await invoke("create_task", {
      request: {
        column_id: columnId,
        title,
        description: description || null,
        position,
        priority: priority || null,
        due_date: dueDate || null,
      },
    });
  },

  update: async (
    id: number,
    updates: {
      columnId?: number;
      title?: string;
      description?: string;
      position?: number;
      priority?: string;
      dueDate?: string;
    }
  ): Promise<Task> => {
    return await invoke("update_task", {
      id,
      request: {
        column_id: updates.columnId ?? null,
        title: updates.title || null,
        description: updates.description || null,
        position: updates.position ?? null,
        priority: updates.priority || null,
        due_date: updates.dueDate || null,
      },
    });
  },

  delete: async (id: number): Promise<void> => {
    return await invoke("delete_task", { id });
  },
};

// Database initialization
export const initializeDatabase = async (): Promise<void> => {
  return await invoke("initialize_database");
};
