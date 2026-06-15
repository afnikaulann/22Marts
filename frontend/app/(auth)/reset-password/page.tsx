"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token reset password tidak ditemukan.");
      router.push("/masuk");
    }
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    const result = await resetPassword({ token, newPassword });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setIsSuccess(true);
    toast.success("Kata sandi berhasil diperbarui!");
    setTimeout(() => {
      router.push("/masuk");
    }, 3000);
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Berhasil!</h2>
        <p className="text-foreground/60 mb-6">
          Kata sandi Anda telah berhasil diperbarui. Anda akan diarahkan ke halaman login dalam beberapa detik.
        </p>
        <Link href="/masuk">
          <Button className="bg-primary hover:brightness-95">Masuk Sekarang</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
          Kata Sandi Baru
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Masukkan Password Baru"
            className="block h-11 w-full rounded-lg border border-purple-100 bg-white pl-10 pr-10 text-sm placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700">
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Ulangi Password Baru"
            className="block h-11 w-full rounded-lg border border-purple-100 bg-white pl-10 pr-10 text-sm placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-lg bg-purple-600 font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Perbarui Kata Sandi"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              <h1 className="mt-6 text-xl font-semibold text-foreground">Reset Kata Sandi</h1>
              <p className="mt-2 text-sm text-foreground/60">
                Silakan masukkan kata sandi baru untuk akun Anda.
              </p>
            </div>

            <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
