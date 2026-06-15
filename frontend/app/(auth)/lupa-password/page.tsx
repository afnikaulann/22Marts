"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { forgotPassword } from "@/lib/api";

export default function LupaPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const result = await forgotPassword(email);

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setIsSubmitted(true);
    toast.success(result.data?.message || "Link reset kata sandi telah dikirim ke email Anda.");
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
              <h1 className="mt-6 text-xl font-semibold text-foreground">Lupa Kata Sandi</h1>
              <p className="mt-2 text-sm text-foreground/60">
                {isSubmitted 
                  ? "Periksa email Anda untuk instruksi reset kata sandi." 
                  : "Masukkan email Anda dan kami akan mengirimkan link untuk mereset kata sandi."}
              </p>
            </div>

            {!isSubmitted ? (
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm hover:brightness-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Link Reset"
                  )}
                </Button>
              </form>
            ) : (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Kirim ulang email
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Ingat kata sandi Anda?{" "}
            <Link href="/masuk" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
