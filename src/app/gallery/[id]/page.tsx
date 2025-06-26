"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import HTMLFlipBook from "react-pageflip";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EbookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ebook, setEbook] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [spread, setSpread] = useState(0); // 0-based index for spread
  const [zoom, setZoom] = useState(1.0);
  const [kindleMode, setKindleMode] = useState(true); // true = Kindle, false = eBook
  const [flipbookZoom, setFlipbookZoom] = useState(1.2);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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
        // Generate signed URL for PDF
        if (data?.pdf_file_url) {
          try {
            const url = new URL(data.pdf_file_url);
            const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
            const filePath = pathMatch ? pathMatch[1] : null;
            if (filePath) {
              const { data: signed, error: signedError } = await supabase.storage.from("ebooks").createSignedUrl(filePath, 60 * 10); // 10 min
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

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [kindleMode]);

  const handleDownload = async () => {
    if (!ebook?.pdf_file_url) return;
    setDownloading(true);
    setError("");
    try {
      const supabase = createClientComponentClient();
      // Extract the storage path from the public URL
      // Example: https://xyz.supabase.co/storage/v1/object/public/ebooks/pdfs/filename.pdf
      // Path: pdfs/filename.pdf
      const url = new URL(ebook.pdf_file_url);
      const pathMatch = url.pathname.match(/object\/public\/ebooks\/(.*)$/);
      const filePath = pathMatch ? pathMatch[1] : null;
      if (!filePath) throw new Error("Invalid file path");
      // Get a signed URL
      const { data, error } = await supabase.storage.from("ebooks").createSignedUrl(filePath, 60);
      if (error) throw error;
      // Download the file
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      setError("Download failed: " + err.message);
    }
    setDownloading(false);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!ebook) return <div className="text-center py-10">Ebook not found.</div>;

  return kindleMode ? (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6 flex flex-col items-center">
        <div className="flex justify-end w-full max-w-3xl mb-2">
          <button
            className={`px-4 py-1 rounded-l bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold transition ${kindleMode ? 'bg-[#1976d2] text-white' : 'hover:bg-[#bbdefb]'}`}
            onClick={() => setKindleMode(true)}
            disabled={kindleMode}
          >
            Kindle
          </button>
          <button
            className={`px-4 py-1 rounded-r bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold transition hover:bg-[#bbdefb]`}
            onClick={() => router.push(`/gallery/${id}/ebook`)}
          >
            eBook
          </button>
        </div>
        <div
          ref={containerRef}
          className="w-full max-w-3xl rounded-t-2xl bg-gradient-to-b from-[#f5f7fa] to-[#e3f0fc] border-x border-t border-[#bbdefb] shadow-2xl relative flex flex-col items-center"
        >
          <div className="flex items-center justify-between px-6 py-3 rounded-t-2xl bg-[#e3f0fc] border-b border-[#bbdefb] shadow-sm w-full">
            <span className="text-lg font-semibold text-[#1a237e] tracking-wide">{ebook.title}</span>
            <span className="text-xs text-[#90a4ae] font-mono">Kindle eBook Reader</span>
          </div>
          <div className="flex flex-col items-center px-2 py-4 w-full" style={{ height: 700, boxShadow: 'inset 0 2px 12px 0 rgba(30, 64, 175, 0.07)' }}>
            <div className="flex justify-center gap-8 items-center mb-4">
              <button
                className="px-4 py-2 rounded bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold hover:bg-[#bbdefb] transition"
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
              >
                Previous
              </button>
              <div className="flex gap-2 items-center">
                <button
                  className="px-3 py-2 rounded bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold hover:bg-[#bbdefb] transition"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="font-mono text-[#1a237e]">{Math.round(zoom * 100)}%</span>
                <button
                  className="px-3 py-2 rounded bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold hover:bg-[#bbdefb] transition"
                  onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}
                  title="Zoom In"
                >
                  +
                </button>
              </div>
              <button
                className="px-4 py-2 rounded bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold hover:bg-[#bbdefb] transition"
                onClick={() => setPageNumber(p => (numPages ? Math.min(p + 1, numPages) : p))}
                disabled={numPages ? pageNumber >= numPages : true}
              >
                Next
              </button>
            </div>
            <Document
              file={signedPdfUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPageNumber(1);
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
              <div className="flex justify-center w-full">
                <Page
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  width={containerWidth > 0 ? containerWidth - 64 : 600}
                  className="bg-white rounded shadow mx-auto"
                />
              </div>
              <div className="text-center text-[#90a4ae] mt-2 text-xs">
                Page {pageNumber} of {numPages}
              </div>
            </Document>
          </div>
        </div>
        <p className="mb-4 text-gray-700 text-center max-w-2xl mx-auto">{ebook.description}</p>
      </div>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6 flex flex-col items-center">
        <div className="flex justify-end w-full max-w-3xl mb-2">
          <button
            className={`px-4 py-1 rounded-l bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold transition ${kindleMode ? 'bg-[#1976d2] text-white' : 'hover:bg-[#bbdefb]'}`}
            onClick={() => setKindleMode(true)}
            disabled={kindleMode}
          >
            Kindle
          </button>
          <button
            className={`px-4 py-1 rounded-r bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] font-bold transition hover:bg-[#bbdefb]`}
            onClick={() => router.push(`/gallery/${id}/ebook`)}
          >
            eBook
          </button>
        </div>
        <div className="w-full max-w-3xl rounded-t-2xl bg-gradient-to-b from-[#f5f7fa] to-[#e3f0fc] border-x border-t border-[#bbdefb] shadow-2xl relative flex flex-col items-center">
          <div className="flex justify-center gap-4 items-center mb-4 mt-2 w-full">
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
            <Button onClick={handleDownload} disabled={downloading} className="ml-4 bg-[#1a237e] text-white font-bold rounded-lg">
              {downloading ? "Preparing download..." : "Download PDF"}
            </Button>
          </div>
          <div className="flex flex-col items-center px-2 py-4 w-full" style={{ height: 700, boxShadow: 'inset 0 2px 12px 0 rgba(30, 64, 175, 0.07)' }}>
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
                width={900}
                height={1200}
                size="stretch"
                minWidth={400}
                maxWidth={1200}
                drawShadow={true}
                showCover={false}
                className="mx-auto my-8"
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
        <p className="mb-4 text-gray-700 text-center max-w-2xl mx-auto">{ebook.description}</p>
      </div>
    </div>
  );
} 