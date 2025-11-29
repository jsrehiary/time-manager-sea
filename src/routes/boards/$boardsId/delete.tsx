import Layout from "@/components/Layout";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { boardApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/boards/$boardsId/delete")({
  component: DeleteBoardModal,
});

function DeleteBoardModal() {
  const { boardsId: boardId } = useParams({ from: "/boards/$boardsId/delete" });
  const navigate = useNavigate();

  const close = () => navigate({ to: "/" });

  const deleteBoard = async () => {
    await boardApi.delete(Number(boardId));
    close();
  };

  return (
    <Layout>
      <Dialog open={true} onOpenChange={close}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
          </DialogHeader>

          <p className="my-4 text-sm text-muted-foreground">
            Are you sure you want to delete this board? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteBoard}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
