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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});


function Index() {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({});
  const [newBoardName, setNewBoardName] = useState("");


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
          <KanbanProvider
            className="h-full"
            columns={columns.map((col) => ({
              id: col.id.toString(),
              name: col.name,
              color:
                col.name.toLowerCase() === "to do"
                  ? "#6B7280"
                  : col.name.toLowerCase() === "in progress"
                    ? "#F59E0B"
                    : col.name.toLowerCase() === "done"
                      ? "#10B981"
                      : "#6B7280", // default gray
            }))}
            data={Object.values(tasksByColumn)
              .flat()
              .map((task) => ({
                id: task.id.toString(),
                name: task.title,
                column: task.column_id.toString(),
                description: task.description,
                dueDate: task.due_date ? new Date(task.due_date) : null,
                priority: task.priority,
              }))}
          >
            {(column) => (
              <KanbanBoard id={column.id} key={column.id}>
                <KanbanHeader>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span>{column.name}</span>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => createTask(parseInt(column.id), column.name)}
                    >
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
                      <KanbanCard
                        column={item.column}
                        id={item.id}
                        key={item.id}
                        name={item.name}
                      >
                        <div className="flex flex-col gap-1 mb-1">
                          <p className="m-0 flex-1 font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-muted-foreground text-xs">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {task.due_date && (
                          <p className="m-0 text-muted-foreground text-xs">
                            {shortDateFormatter.format(new Date(task.due_date))}
                          </p>
                        )}
                      </KanbanCard>
                    );
                  }}
                </KanbanCards>
              </KanbanBoard>
            )}
          </KanbanProvider>
        </div>


      </Layout>
    </>
  );
}
