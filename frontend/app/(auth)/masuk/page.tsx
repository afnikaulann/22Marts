"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { login, resendVerification } from "@/lib/api";

export default function MasukPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);

  async function handleResendVerification() {
    if (!unverifiedEmail) return;
    setResending(true);
    const result = await resendVerification(unverifiedEmail);
    setResending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Email verifikasi telah dikirim ulang!");
      setUnverifiedEmail("");
      setError("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await login({ email, password });

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      // Check if the error is about unverified email
      if (result.error.toLowerCase().includes("belum diverifikasi")) {
        setUnverifiedEmail(email);
      }
      return;
    }

    if (result.data?.token) {
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      // Set cookie for middleware & backend auth fallback (nginx always forwards cookies)
      const isSecure = window.location.protocol === "https:";
      document.cookie = `token=${result.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
    }

    toast.success("Login berhasil!");
    if (result.data?.user.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/5">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-purple-100 bg-white p-8 shadow-sm">
            <div className="text-center">
              <Link href="/" className="inline-block">
                <Image
                  src="/22mart.png"
                  alt="22Mart"
                  width={180}
                  height={60}
                  className="h-14 w-auto"
                  priority
                />
              </Link>
              <h1 className="mt-6 text-xl font-semibold text-foreground">Masuk ke Akun Anda</h1>
              <p className="mt-2 text-sm text-foreground/60">
                Selamat datang kembali! Silakan masuk untuk melanjutkan.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
                {unverifiedEmail && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="ml-1 font-semibold underline hover:no-underline disabled:opacity-50"
                  >
                    {resending ? "Mengirim..." : "Kirim ulang email verifikasi"}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Masukkan Email Anda"
                    className="block h-11 w-full rounded-lg border border-purple-100 bg-white pl-10 pr-4 text-sm placeholder:text-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Kata Sandi
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Masukkan Password Anda"
                    className="block h-11 w-full rounded-lg border border-purple-100 bg-white pl-10 pr-10 text-sm placeholder:text-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-purple-200 text-secondary focus:ring-secondary"
                  />
                  <span className="text-foreground/60">Ingat Saya</span>
                </label>
                <Link href="/lupa-password" className="font-medium text-foreground hover:underline">
                  Lupa Kata Sandi?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm hover:brightness-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Belum punya akun?{" "}
            <Link href="/daftar" className="font-medium text-foreground hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
