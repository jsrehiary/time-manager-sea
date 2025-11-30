import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { taskApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";

export const Route = createFileRoute("/my-task")({
  component: RouteComponent,
});

const ColumnsFeature = [
  { id: "high", name: "High", color: "#6B7280" },
  { id: "medium", name: "Medium", color: "#F59E0B" },
  { id: "low", name: "Low", color: "#10B981" },
];

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      return await taskApi.getAllTasks();
    },
  });

  return (
    <>
      <Layout>
        <div className="flex flex-row text-white items-center">
          <div className="flex-1 text-2xl flex flex-row gap-2 items-center">
            <Pencil className="size-6 text-purple-600" />
            <h1 className="font-bold tracking-wider">My Task</h1>
          </div>
          <div className="flex">
            <Button
              variant={"default"}
              className="bg-white text-purple-brand text-sm font-medium hover:bg-white/80"
            >
              + Add Task
            </Button>
          </div>
        </div>
        <div>
          {/* create 3 columns for high, medium, and low priority tasks */}
          {ColumnsFeature.map((column) => (
            <div key={column.id} className="mt-8">
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: column.color }}
              >
                {column.name} Priority
              </h2>
              <div className="space-y-4">
                {data
                  ?.filter((task) => task.priority === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-white/10 rounded-lg shadow-sm hover:bg-white/20 transition"
                    >
                      <h3 className="text-md font-medium text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        Due:{" "}
                        {task.due_date &&
                          new Date(
                            task.due_date?.replace(" ", "T").replace(/\s+/g, "")
                          ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Layout>
    </>
  );
}
