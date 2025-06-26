import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteEbookButton from "@/components/DeleteEbookButton";

export default async function AdminEbooksPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return <div className="text-center text-lg mt-20 text-[#37474f]">You do not have admin privileges.</div>;
  }

  // Fetch ebooks uploaded by this admin
  const { data: ebooks, error } = await supabase
    .from("ebooks")
    .select("id, title, description, cover_image_url, pdf_file_url, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#e3f0fc] text-[#1a237e] px-4 py-10 font-sans">
      <Card className="w-full max-w-4xl bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1a237e] text-center mb-2">
            My Uploaded Ebooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error.message}</div>}
          {ebooks && ebooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-[#1a237e] font-sans border-separate border-spacing-y-2">
                <thead>
                  <tr className="border-b border-[#bbdefb] bg-[#e3f0fc]">
                    <th className="py-2 px-4 text-left">Title</th>
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ebooks.map((ebook) => (
                    <tr key={ebook.id} className="border-b border-[#e3f0fc] hover:bg-[#f5faff] rounded-lg">
                      <td className="py-2 px-4 font-semibold max-w-xs truncate">{ebook.title}</td>
                      <td className="py-2 px-4 max-w-md truncate text-[#37474f]">{ebook.description}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <Link href={`/dashboard/edit/${ebook.id}`}>
                          <Button size="sm" className="bg-[#1a237e] text-white hover:bg-[#1976d2] font-bold rounded-lg">Edit</Button>
                        </Link>
                        <DeleteEbookButton ebookId={ebook.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-[#90a4ae] text-center py-8">No ebooks uploaded yet.</div>
          )}
        </CardContent>
      </Card>
    </main>
  );
} 