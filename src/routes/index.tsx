import Layout from "@/components/Layout";
import { createFileRoute } from "@tanstack/react-router";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  KanbanItemProps,
  DragEndEvent,
} from "@/components/ui/shadcn-io/kanban";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PERMANENT_COLUMNS = [
  { id: "to_do", name: "To Do", color: "#3b82f6" },
  { id: "in_progress", name: "In Progress", color: "#eab308" },
  { id: "done", name: "Done", color: "#22c55e" },
];

const statusLookup = (id: number) => {
  switch (id) {
    case 1:
      return "to_do";
    case 2:
      return "in_progress";
    case 3:
      return "done";
    default:
      return "to_do";
  }
};

const statusReverseLookup = (status: string) => {
  switch (status) {
    case "to_do":
      return 1;
    case "in_progress":
      return 2;
    case "done":
      return 3;
    default:
      return 1;
  }
};

const defaultDueDate = new Date().toISOString().split("T")[0];

function KanbanPage() {
  const [currentColumnId, setCurrentColumnId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<string>("low");
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      return await taskApi.getAllTasks();
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    await taskApi.updateStatus(Number(active.id), over?.id as string);

    queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentColumnId === null) return;

    try {
      // Convert YYYY-MM-DD to RFC3339 format
      const dueDateRFC3339 = dueDate
        ? new Date(dueDate + "T00:00:00Z").toISOString()
        : undefined;

      await taskApi.create(
        title,
        statusLookup(currentColumnId), // status is 2nd parameter
        priority, // priority is 3rd parameter
        dueDateRFC3339,
        description
      );
    } catch (error) {
      console.error("Error creating task:", error);
    }

    setTitle("");
    setPriority("low");
    setDueDate(defaultDueDate);
    setDescription("");
    setIsOpen(false);

    queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
  };

  if (isLoading) {
    return <Layout>Loading tasks...</Layout>;
  }

  if (error) {
    return (
      <Layout>
        <h1 className="text-white text-xl">
          Error loading tasks: {(error as Error).message}
        </h1>
      </Layout>
    );
  }

  const kanbanData: KanbanItemProps[] =
    data?.map((task) => ({
      id: task.id.toString(),
      name: task.title,
      column: task.status,
    })) || [];

  return (
    <Layout>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <form>
          <KanbanProvider
            columns={PERMANENT_COLUMNS.map((c) => ({
              id: c.id.toString(),
              name: c.name,
              color: c.color,
            }))}
            data={kanbanData}
            onDragEnd={handleDragEnd}
          >
            {(column) => (
              <KanbanBoard id={column.id} key={column.id} className="h-[90vh]">
                <KanbanHeader>
                  <div className="flex flex-row">
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span>{column.name}</span>
                    </div>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCurrentColumnId(Number(column.id));
                        }}
                      >
                        + New Task
                      </Button>
                    </DialogTrigger>
                  </div>
                </KanbanHeader>
                <KanbanCards id={column.id}>
                  {(item) => {
                    const task = data?.find((t) => t.id.toString() === item.id);
                    if (!task) return null;
                    return (
                      <KanbanCard
                        key={item.id}
                        {...item}
                        data-status={task.status}
                      >
                        <div className="p-2 rounded">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">
                            {task.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500 mt-4">
                            Due:{" "}
                            {task.due_date
                              ? new Date(
                                  task.due_date
                                    .replace(" ", "T")
                                    .replace(/\s+/g, "")
                                ).toLocaleDateString()
                              : "No due date"}
                          </p>
                        </div>
                      </KanbanCard>
                    );
                  }}
                </KanbanCards>
              </KanbanBoard>
            )}
          </KanbanProvider>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new task.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Implement new feature"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Task details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" onValueChange={(v) => setPriority(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={defaultDueDate}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={submitTask}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </Layout>
  );
}

export const Route = createFileRoute("/")({
  component: KanbanPage,
});
