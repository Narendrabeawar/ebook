"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditEbookPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchEbook = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("ebooks")
        .select("title, description, cover_image_url, pdf_file_url")
        .eq("id", id)
        .single();
      if (error) setError(error.message);
      else {
        setTitle(data.title);
        setDescription(data.description);
        setCoverUrl(data.cover_image_url);
        setPdfUrl(data.pdf_file_url);
      }
      setLoading(false);
    };
    if (id) fetchEbook();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    let newCoverUrl = coverUrl;
    let newPdfUrl = pdfUrl;
    // Upload new cover if selected
    if (coverFile) {
      // Delete previous cover if it exists
      if (coverUrl) {
        try {
          const url = new URL(coverUrl);
          const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
          const filePath = pathMatch ? pathMatch[1] : null;
          if (filePath) {
            await supabase.storage.from("ebooks").remove([filePath]);
          }
        } catch (e) { /* ignore errors */ }
      }
      const { data, error: coverError } = await supabase.storage.from("ebooks").upload(`covers/${Date.now()}-${coverFile.name}`, coverFile);
      if (coverError) {
        setError("Cover upload failed: " + coverError.message);
        setSaving(false);
        return;
      }
      newCoverUrl = supabase.storage.from("ebooks").getPublicUrl(data.path).data.publicUrl;
    }
    // Upload new PDF if selected
    if (pdfFile) {
      const { data, error: pdfError } = await supabase.storage.from("ebooks").upload(`pdfs/${Date.now()}-${pdfFile.name}`, pdfFile);
      if (pdfError) {
        setError("PDF upload failed: " + pdfError.message);
        setSaving(false);
        return;
      }
      newPdfUrl = supabase.storage.from("ebooks").getPublicUrl(data.path).data.publicUrl;
    }
    // Update ebook in DB
    const { error: dbError } = await supabase.from("ebooks").update({
      title,
      description,
      cover_image_url: newCoverUrl,
      pdf_file_url: newPdfUrl,
    }).eq("id", id);
    if (dbError) {
      setError("Database error: " + dbError.message);
      setSaving(false);
      return;
    }
    setSuccess("Ebook updated successfully!");
    setSaving(false);
    setCoverFile(null);
    setPdfFile(null);
    formRef.current?.reset();
    setTimeout(() => router.push("/dashboard/ebooks"), 1200);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#e3f0fc] text-[#1a237e] px-4 py-10 font-sans">
      <Card className="w-full max-w-xl bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1a237e] text-center mb-2">Edit Ebook</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            <div>
              <Label htmlFor="cover">Cover Image</Label>
              {coverUrl && <img src={coverUrl} alt="Cover" className="w-32 h-40 object-cover rounded mb-2 border border-[#bbdefb]" />}
              <Input id="cover" type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverFile(e.target.files?.[0] || null)} className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            <div>
              <Label htmlFor="pdf">PDF File</Label>
              {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="block text-[#1a237e] underline mb-2">Current PDF</a>}
              <Input id="pdf" type="file" accept="application/pdf" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfFile(e.target.files?.[0] || null)} className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#1976d2]" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
} 