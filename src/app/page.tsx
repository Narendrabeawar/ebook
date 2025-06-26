import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#e3f0fc] text-[#1a237e] px-4 font-sans">
      <nav className="flex gap-4 mb-8 mt-8">
        <Link href="/login">
          <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-semibold shadow-sm">Admin Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-semibold shadow-sm">Register</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-semibold shadow-sm">Dashboard</Button>
        </Link>
      </nav>
      <Card className="w-full max-w-2xl bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardContent className="py-14 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-[#1976d2] w-8 h-8" />
            <h1 className="text-4xl font-bold text-[#1a237e] text-center">
              Welcome to the Premium Ebook Library
            </h1>
          </div>
          <p className="mb-10 text-lg text-[#37474f] text-center max-w-xl font-normal">
            Discover, read, and download ebooks in a beautifully designed, secure platform. Enjoy a curated collection with a professional, minimal look.
          </p>
          <Link href="/gallery">
            <Button className="bg-[#1a237e] text-white font-bold px-10 py-4 text-lg rounded-lg shadow-md hover:bg-[#1976d2] transition-all duration-200">
              Browse Gallery
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="mt-12 text-[#37474f]/80 text-sm text-center">
        &copy; {new Date().getFullYear()} Premium Ebook Library. All rights reserved.
      </footer>
    </main>
  );
}
