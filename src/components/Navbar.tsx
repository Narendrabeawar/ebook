"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ email: user.email ?? '', id: user.id });
        // Fetch admin status
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(!!profile?.is_admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);
  if (!mounted) return null;

  const avatarInitial = user && typeof user.email === 'string' && user.email.length > 0
    ? user.email[0].toUpperCase()
    : '';
  const userEmail = typeof user?.email === 'string' ? user.email : '';

  return (
    <nav className="w-full bg-white shadow-lg px-4 py-2 flex items-center justify-between sticky top-0 z-50 border-b border-[#bbdefb]">
      <div className="flex items-center gap-4">
        <Link href="/">
          <span className="text-xl font-extrabold text-[#1a237e] tracking-tight">EbookLib</span>
        </Link>
        <Link href="/gallery">
          <Button
            variant="ghost"
            className={
              (pathname === "/gallery"
                ? "bg-[#e3f0fc] text-[#1976d2] font-bold shadow-none"
                : "text-[#1a237e] font-semibold") +
              " px-4 py-2 rounded-md transition"
            }
          >
            Gallery
          </Button>
        </Link>
        {user && (
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className={
                (pathname.startsWith("/dashboard")
                  ? "bg-[#e3f0fc] text-[#1976d2] font-bold shadow-none"
                  : "text-[#1a237e] font-semibold") +
                " px-4 py-2 rounded-md transition"
              }
            >
              Dashboard
            </Button>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{avatarInitial}</AvatarFallback>
            </Avatar>
            <span className="text-[#1a237e] font-medium text-sm hidden sm:inline">{userEmail}</span>
            {isAdmin && <Badge className="bg-[#1976d2] text-white ml-2">Admin</Badge>}
            <form action="/auth/signout" method="post">
              <Button size="sm" variant="outline" className="ml-2 border-[#bbdefb] text-[#1a237e] hover:bg-[#bbdefb] hover:text-[#1a237e]">Sign out</Button>
            </form>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button size="sm" variant="outline" className="border-[#bbdefb] text-[#1a237e] hover:bg-[#bbdefb] hover:text-[#1a237e]">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="outline" className="border-[#bbdefb] text-[#1a237e] hover:bg-[#bbdefb] hover:text-[#1a237e]">Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
} 