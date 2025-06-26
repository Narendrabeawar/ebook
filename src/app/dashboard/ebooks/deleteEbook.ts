"use server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function deleteEbook(formData: FormData) {
  const id = formData.get("id");
  if (!id) return;
  const supabase = createServerActionClient({ cookies });
  // Fetch ebook to get cover and pdf URLs
  const { data: ebook } = await supabase.from("ebooks").select("cover_image_url, pdf_file_url").eq("id", id).single();
  // Delete ebook from DB
  await supabase.from("ebooks").delete().eq("id", id);
  // Remove cover and PDF from storage if they exist
  if (ebook?.cover_image_url) {
    try {
      const url = new URL(ebook.cover_image_url);
      const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
      const filePath = pathMatch ? pathMatch[1] : null;
      if (filePath) {
        await supabase.storage.from("ebooks").remove([filePath]);
      }
    } catch {}
  }
  if (ebook?.pdf_file_url) {
    try {
      const url = new URL(ebook.pdf_file_url);
      const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
      const filePath = pathMatch ? pathMatch[1] : null;
      if (filePath) {
        await supabase.storage.from("ebooks").remove([filePath]);
      }
    } catch {}
  }
} 