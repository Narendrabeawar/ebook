import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UserManagementPage() {
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

  // Fetch all users with profile info
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, is_admin, auth:users(email, created_at)")
    .order("auth:users.created_at", { ascending: false });

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    "use server";
    const supabase = createServerComponentClient({ cookies });
    await supabase.from("profiles").update({ is_admin: !currentStatus }).eq("id", userId);
    // Optionally, revalidate or redirect
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#e3f0fc] text-[#1a237e] px-4 py-10 font-sans">
      <Card className="w-full max-w-4xl bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1a237e] text-center mb-2">
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error.message}</div>}
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-[#1a237e] font-sans border-separate border-spacing-y-2">
                <thead>
                  <tr className="border-b border-[#bbdefb] bg-[#e3f0fc]">
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Registered</th>
                    <th className="py-2 px-4 text-center">Admin</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-[#e3f0fc] hover:bg-[#f5faff] rounded-lg">
                      <td className="py-2 px-4 font-mono">{u.auth?.users?.email || "-"}</td>
                      <td className="py-2 px-4">{u.auth?.users?.created_at ? new Date(u.auth.users.created_at).toLocaleString() : "-"}</td>
                      <td className="py-2 px-4 text-center">{u.is_admin ? "Yes" : "No"}</td>
                      <td className="py-2 px-4 text-center">
                        <form action={async () => { await toggleAdmin(u.id, u.is_admin); }}>
                          <Button size="sm" variant={u.is_admin ? "secondary" : "default"} className={u.is_admin ? "bg-[#e3f0fc] text-[#1a237e] border border-[#bbdefb] hover:bg-[#bbdefb] rounded-lg" : "bg-[#1a237e] text-white hover:bg-[#1976d2] font-bold rounded-lg"}>
                            {u.is_admin ? "Revoke Admin" : "Make Admin"}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-[#90a4ae] text-center py-8">No users found.</div>
          )}
        </CardContent>
      </Card>
    </main>
  );
} 