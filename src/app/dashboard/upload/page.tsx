"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadEbookPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!pdfFile) {
      setError("Please select a PDF file.");
      setLoading(false);
      return;
    }
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    // Upload cover image if present
    let coverUrl = "";
    if (coverFile) {
      const { data, error: coverError } = await supabase.storage.from("ebooks").upload(`covers/${Date.now()}-${coverFile.name}`, coverFile);
      if (coverError) {
        setError("Cover upload failed: " + coverError.message);
        setLoading(false);
        return;
      }
      coverUrl = supabase.storage.from("ebooks").getPublicUrl(data.path).data.publicUrl;
    }
    // Upload PDF
    const { data: pdfData, error: pdfError } = await supabase.storage.from("ebooks").upload(`pdfs/${Date.now()}-${pdfFile.name}`, pdfFile);
    if (pdfError) {
      setError("PDF upload failed: " + pdfError.message);
      setLoading(false);
      return;
    }
    const pdfUrl = supabase.storage.from("ebooks").getPublicUrl(pdfData.path).data.publicUrl;
    // Insert into ebooks table
    const { error: dbError } = await supabase.from("ebooks").insert({
      title,
      description,
      cover_image_url: coverUrl,
      pdf_file_url: pdfUrl,
      created_by: user.id
    });
    if (dbError) {
      setError("Database error: " + dbError.message);
      setLoading(false);
      return;
    }
    setSuccess("Ebook uploaded successfully!");
    setLoading(false);
    setTitle("");
    setDescription("");
    setPdfFile(null);
    setCoverFile(null);
    formRef.current?.reset();
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#e3f0fc] text-[#1a237e] px-4 py-10 font-sans">
      <Card className="w-full max-w-xl bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1a237e] text-center mb-2">Upload Ebook</CardTitle>
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
              <Label htmlFor="cover">Cover Image (optional)</Label>
              <Input id="cover" type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverFile(e.target.files?.[0] || null)} className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            <div>
              <Label htmlFor="pdf">PDF File</Label>
              <Input id="pdf" type="file" accept="application/pdf" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfFile(e.target.files?.[0] || null)} required className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#1976d2]" disabled={loading}>{loading ? "Uploading..." : "Upload Ebook"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
} 