import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#e3f0fc] text-[#1a237e] px-4 font-sans">
      <Card className="w-full max-w-2xl bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#1a237e] text-center mb-2">
            Welcome to your Dashboard
          </CardTitle>
          <CardDescription className="text-[#37474f] text-center">
            You are logged in as <span className="font-mono">{user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {profile?.is_admin ? (
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <Link href="/dashboard/upload" className="w-full md:w-auto">
                <Button className="bg-[#1a237e] text-white hover:bg-[#1976d2] font-bold w-full md:w-auto px-8 py-4 text-lg rounded-lg shadow-md transition">
                  Upload Ebook
                </Button>
              </Link>
              <Link href="/dashboard/ebooks" className="w-full md:w-auto">
                <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-bold w-full md:w-auto px-8 py-4 text-lg rounded-lg shadow-md transition">
                  Manage Ebooks
                </Button>
              </Link>
              <Link href="/gallery" className="w-full md:w-auto">
                <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-bold w-full md:w-auto px-8 py-4 text-lg rounded-lg shadow-md transition">
                  Go to Gallery
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-[#37474f] text-center text-lg font-semibold">
              You do not have admin privileges.<br />
              Please contact the site administrator if you need access.
            </div>
          )}
          <form action="/auth/signout" method="post" className="w-full flex justify-center mt-4">
            <Button type="submit" variant="secondary" className="w-full md:w-auto bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] hover:bg-[#bbdefb] rounded-lg">Sign out</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
} 