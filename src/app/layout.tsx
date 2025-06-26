import "./globals.css";
import Navbar from "@/components/Navbar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const metadata = {
  title: "Premium Ebook Library",
  description: "Discover, read, and download ebooks in a premium, secure platform.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  let userName = '';
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, name")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
    userName = profile?.name || '';
  }
  return (
    <html lang="en">
      <body className="bg-premium-dark min-h-screen">
        <Navbar user={user} isAdmin={isAdmin} userName={userName} />
        {children}
      </body>
    </html>
  );
}
