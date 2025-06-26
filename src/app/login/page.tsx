"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#e3f0fc] text-[#1a237e] px-4 font-sans">
      <Card className="w-full max-w-md bg-white shadow-xl border border-[#bbdefb] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1a237e] text-center mb-2">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-[#f5faff] border border-[#bbdefb] rounded-lg" />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#1976d2]" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
          </form>
          <div className="mt-4 text-sm text-center text-[#37474f]">
            Don&apos;t have an account? <a href="/register" className="underline text-[#1976d2]">Register</a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 