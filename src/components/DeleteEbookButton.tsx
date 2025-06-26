"use client";
import { Button } from "@/components/ui/button";
import deleteEbook from "@/app/dashboard/ebooks/deleteEbook";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteEbookButton({ ebookId }: { ebookId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete(formData: FormData) {
    await deleteEbook(formData);
    router.refresh(); // Refresh the page to update the list
    // Optionally, you can use router.push("/dashboard/ebooks") to force redirect
  }

  return (
    <form
      action={handleDelete}
      onSubmit={e => {
        if (!confirm("Are you sure you want to delete this ebook?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={ebookId} />
      <Button size="sm" variant="destructive" disabled={isPending}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  );
} 