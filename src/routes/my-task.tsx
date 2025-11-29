import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-task")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Layout>
        <div className="flex flex-row text-white">
          <div className="flex-1">
            <h1>My Task</h1>
          </div>
          <div className="flex ">
            <Button variant={"default"} className="bg-white text-purple-brand text-sm font-medium hover:bg-white/80">
              + Add Task
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
