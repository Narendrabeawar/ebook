import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GalleryPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: ebooks, error } = await supabase
    .from("ebooks")
    .select("id, title, description, cover_image_url, pdf_file_url")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Failed to load ebooks: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-[#e3f0fc] px-4 py-10 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#1a237e]">Ebook Gallery</h1>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {ebooks && ebooks.length > 0 ? (
          ebooks.map((ebook) => (
            <Link
              key={ebook.id}
              href={`/gallery/${ebook.id}`}
              className="bg-[#abd9d7] border border-[#bbdefb] rounded-2xl shadow-md p-2 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200 max-w-xs w-full mx-auto"
            >
              {ebook.cover_image_url ? (
                <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden">
                  <Image
                    src={ebook.cover_image_url}
                    alt={ebook.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-[#e3f0fc] flex items-center justify-center mb-2 rounded-lg">
                  <span className="text-[#90a4ae] text-xs">No Cover</span>
                </div>
              )}
              <h2 className="text-base font-semibold mb-1 line-clamp-1 text-[#1a237e]">{ebook.title}</h2>
              <p className="text-xs text-[#37474f] mb-2 line-clamp-2">{ebook.description}</p>
              <span className="mt-auto text-[#1976d2] font-bold text-xs underline opacity-0 group-hover:opacity-100 transition-opacity">Read Book</span>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-[#90a4ae]">No ebooks found.</div>
        )}
      </div>
    </div>
  );
} 