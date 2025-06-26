"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import HTMLFlipBook from "react-pageflip";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EbookFlipbookPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ebook, setEbook] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [flipbookZoom, setFlipbookZoom] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchEbook = async () => {
      setLoading(true);
      setError("");
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("ebooks")
        .select("id, title, description, pdf_file_url, cover_image_url")
        .eq("id", id)
        .single();
      if (error) setError(error.message);
      else {
        setEbook(data);
        if (data?.pdf_file_url) {
          try {
            const url = new URL(data.pdf_file_url);
            const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
            const filePath = pathMatch ? pathMatch[1] : null;
            if (filePath) {
              const { data: signed, error: signedError } = await supabase.storage.from("ebooks").createSignedUrl(filePath, 60 * 10);
              if (signedError) setError(signedError.message);
              else setSignedPdfUrl(signed.signedUrl);
            } else {
              setSignedPdfUrl(null);
            }
          } catch (e: any) {
            setSignedPdfUrl(null);
          }
        } else {
          setSignedPdfUrl(null);
        }
      }
      setLoading(false);
    };
    if (id) fetchEbook();
  }, [id]);

  const handleDownload = async () => {
    if (!ebook?.pdf_file_url) return;
    setDownloading(true);
    setError("");
    try {
      const supabase = createClientComponentClient();
      const url = new URL(ebook.pdf_file_url);
      const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
      const filePath = pathMatch ? pathMatch[1] : null;
      if (!filePath) throw new Error("Invalid file path");
      const { data, error } = await supabase.storage.from("ebooks").createSignedUrl(filePath, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      setError("Download failed: " + err.message);
    }
    setDownloading(false);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!ebook) return <div className="text-center py-10">Ebook not found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-2 bg-white">
      <div className="max-w-[1152px] mx-auto w-full flex flex-col items-center justify-center">
        <div className="flex flex-wrap justify-center gap-4 items-center mb-6 w-full">
          <Button
            className="bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold rounded-lg px-4 py-2 hover:bg-[#bbdefb]"
            onClick={() => router.push(`/gallery/${id}`)}
          >
            ← Back to Kindle
          </Button>
          <span className="text-[#1a237e] font-semibold">Zoom:</span>
          <button
            className="px-3 py-2 rounded bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold hover:bg-[#bbdefb] transition"
            onClick={() => setFlipbookZoom(z => Math.max(0.7, z - 0.1))}
            title="Zoom Out"
          >
            -
          </button>
          <span className="font-mono text-[#1a237e]">{Math.round(flipbookZoom * 100)}%</span>
          <button
            className="px-3 py-2 rounded bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold hover:bg-[#bbdefb] transition"
            onClick={() => setFlipbookZoom(z => Math.min(2.0, z + 0.1))}
            title="Zoom In"
          >
            +
          </button>
          <Button onClick={handleDownload} disabled={downloading} className="bg-[#1a237e] text-white font-bold rounded-lg px-4 py-2 ml-2">
            {downloading ? "Preparing download..." : "Download PDF"}
          </Button>
        </div>
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="w-[1050px]">
            <Document
              file={signedPdfUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setError("");
              }}
              onLoadError={(error) => {
                if (!numPages) {
                  setError(error?.message || String(error));
                }
              }}
              loading={<div className="p-8 text-center">Loading PDF...</div>}
              error={null}
            >
              <HTMLFlipBook
                width={1050}
                height={1200}
                size="stretch"
                minWidth={600}
                maxWidth={1152}
                drawShadow={true}
                showCover={false}
                className="my-8"
                style={{ boxShadow: '0 4px 32px 0 rgba(30, 64, 175, 0.10)' }}
                startPage={0}
                flippingTime={600}
                usePortrait={true}
                startZIndex={0}
                autoSize={true}
                maxShadowOpacity={0.5}
                mobileScrollSupport={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
                minHeight={400}
                maxHeight={1200}
              >
                {Array.from(new Array(numPages || 0), (_, idx) => (
                  <div key={`flip_page_${idx + 1}`} className="flex items-center justify-center bg-white rounded shadow h-full">
                    <Page
                      pageNumber={idx + 1}
                      width={800}
                      height={1100}
                      scale={flipbookZoom}
                      className="mx-auto"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </Document>
          </div>
        </div>
      </div>
      <p className="mb-4 text-gray-700 text-center max-w-2xl mx-auto mt-6">{ebook.description}</p>
    </div>
  );
} 