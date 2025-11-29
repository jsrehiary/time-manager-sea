import Layout from "@/components/Layout";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { boardApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/boards/new")({
  component: NewBoardModal,
});

function NewBoardModal() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const close = () => navigate({ to: "/" });

  const createBoard = async () => {
    if (!name.trim()) return;
    await boardApi.create(name);
    close();
  };

  return (
    <Layout>
      <Dialog open={true} onOpenChange={close}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>

          <input
            className="border p-2 w-full mb-4 rounded"
            placeholder="Board name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <DialogFooter>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button variant="default" onClick={createBoard}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
