import Layout from "@/components/Layout";
import { useEffect, useState } from 'react';
import { boardApi, columnApi, taskApi, Board, Column, Task } from '@/lib/api';
import { createFileRoute } from "@tanstack/react-router";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});


function Index() {
  // -------- State --------
  const [boards, setBoards] = useState<Board[]>([]); // list semua board
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null); // board yang dipilih
  const [columns, setColumns] = useState<Column[]>([]); // column dari board yang dipilih
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({}); // task per column
  const [newBoardName, setNewBoardName] = useState(""); // input nama board baru
  const [showModal, setShowModal] = useState(false); // modal create board
  const columnsToBeRendered = [
    { id: 0, name: 'To Do', color: '#6B7280' },
    { id: 1, name: 'In Progress', color: '#F59E0B' },
    { id: 2, name: 'Done', color: '#10B981' },
  ];

  const [showBoardModal, setShowBoardModal] = useState(false);

  // Modal create task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskColumnId, setTaskColumnId] = useState<number | null>(null);

  // -------- Fungsi --------
  const loadBoards = async () => {
    const data = await boardApi.getAll();
    setBoards(data);
  };

  const loadColumns = async (boardId: number) => {
    const cols = await columnApi.getByBoard(boardId);
    setColumns(cols);

    const tasksMap: Record<number, Task[]> = {};
    for (const col of cols) {
      tasksMap[col.id] = await taskApi.getByColumn(col.id);
    }
    setTasksByColumn(tasksMap);
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    const newBoard = await boardApi.create(newBoardName);
    setBoards([...boards, newBoard]);
    setNewBoardName("");
    setShowModal(false);
  };

  const createTask = async () => {
    if (taskColumnId === null || !taskTitle.trim()) return;

    const tasks = tasksByColumn[taskColumnId] || [];
    const newTask = await taskApi.create(taskColumnId, taskTitle, tasks.length);

    setTasksByColumn({
      ...tasksByColumn,
      [taskColumnId]: [...tasks, newTask],
    });

    setShowTaskModal(false);
    setTaskTitle("");
    setTaskColumnId(null);
  };


  // -------- Create Task --------
  const openTaskModal = (columnId: number) => {
    setTaskColumnId(columnId);
    setTaskTitle("");
    setShowTaskModal(true);
  };

  // -------- Effects --------
  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      loadColumns(selectedBoard.id);
    }
  }, [selectedBoard]);

  // -------- Date formatter --------
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });


  return (
    <>
      <Layout>
        <div className="container">

          {/* === BOARD LIST & CREATE BOARD === */}
          {!selectedBoard && (
            <>
              <Button onClick={() => setShowBoardModal(true)}>New Board</Button>

              {showBoardModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded p-6 w-96">
                    <h2 className="text-lg font-bold mb-4">Create Board</h2>
                    <input
                      type="text"
                      placeholder="Board name..."
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="border rounded px-2 py-1 w-full mb-4"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBoardModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createBoard}>Create</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Boards */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                {boards.map((b) => (
                  <div
                    key={b.id}
                    className="border rounded p-4 flex justify-between items-center hover:bg-gray-700"
                  >
                    <span
                      className="cursor-pointer"
                      onClick={() => setSelectedBoard(b)}
                    >
                      {b.name}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete "${b.name}"?`)) return;
                        await boardApi.delete(b.id);
                        setBoards(boards.filter((board) => board.id !== b.id));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>

            </>
          )}

          {/* === KANBAN BOARD === */}
          {selectedBoard && (
            <>
              <Button className="mb-4" onClick={() => setSelectedBoard(null)}>
                Back to Projects
              </Button>

              <KanbanProvider
                className="h-full"
                columns={columnsToBeRendered.map((c) => ({
                  id: c.id.toString(),
                  name: c.name,
                  color: c.color,
                }))}
                data={Object.values(tasksByColumn)
                  .flat()
                  .map((t) => ({
                    id: t.id.toString(),
                    name: t.title,
                    column: t.column_id.toString(),
                  }))}
              >
                {(column) => (
                  <KanbanBoard id={column.id} key={column.id}>
                    <KanbanHeader>
                      <div className="flex flex-row justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                          <span>{column.name}</span>
                        </div>
                        <Button variant="default" size="sm" onClick={() => openTaskModal(parseInt(column.id))}>
                          + Add Task
                        </Button>
                      </div>
                    </KanbanHeader>

                    <KanbanCards id={column.id}>
                      {(item) => {
                        const task = Object.values(tasksByColumn)
                          .flat()
                          .find((t) => t.id.toString() === item.id)!;

                        return (
                          <KanbanCard column={item.column} id={item.id} key={item.id} name={item.name}>
                            <div className="flex items-start justify-between gap-2 h-12 mb-1">
                              <p className="m-0 flex-1 font-medium text-sm">{task.title}</p>
                            </div>
                            <p className="m-0 text-muted-foreground text-xs">
                              {task.due_date
                                ? shortDateFormatter.format(new Date(task.due_date)) + " - " + dateFormatter.format(new Date(task.due_date))
                                : "No due date"}
                            </p>
                          </KanbanCard>
                        );
                      }}
                    </KanbanCards>
                  </KanbanBoard>
                )}
              </KanbanProvider>

              {/* Task Modal */}
              {showTaskModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded p-6 w-96">
                    <h2 className="text-lg font-bold mb-4">Create Task</h2>
                    <input
                      type="text"
                      placeholder="Task title..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="border rounded px-2 py-1 w-full mb-4"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                        Cancel
                      </Button>

                      {/* FIXME: This doesn't work */}
                      <Button onClick={() => createTask()}>Create</Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
