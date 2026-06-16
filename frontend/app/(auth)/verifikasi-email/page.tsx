"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
const Navbar = dynamic(() => import("@/components/navbar").then(mod => mod.Navbar), { ssr: true });
import { verifyEmail } from "@/lib/api";

function VerifikasiEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function doVerify() {
      if (!token) {
        setStatus("error");
        setMessage("Token verifikasi tidak ditemukan.");
        return;
      }

      const result = await verifyEmail(token);

      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage(result.data?.message || "Email Anda berhasil diverifikasi!");
      }
    }

    doVerify();
  }, [token]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-purple-100 bg-white p-8 shadow-sm text-center">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/22mart.png"
            alt="22Mart"
            width={180}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </Link>

        {status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-secondary mb-4" />
            <h1 className="text-xl font-semibold text-foreground">Memverifikasi Email</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Mohon tunggu sebentar, kami sedang memverifikasi akun Anda...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Verifikasi Berhasil!</h1>
            <p className="mt-2 text-sm text-foreground/60">
              {message}
            </p>
            <Button
              asChild
              className="mt-8 h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm hover:brightness-95"
            >
              <Link href="/masuk">
                Masuk ke Akun <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-8">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Verifikasi Gagal</h1>
            <p className="mt-2 text-sm text-foreground/60">
              {message}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-8 h-11 w-full rounded-lg border-purple-100 font-semibold"
            >
              <Link href="/daftar">
                Kembali ke Pendaftaran
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifikasiEmailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/5">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense fallback={
          <div className="w-full max-w-md rounded-2xl border border-purple-100 bg-white p-8 shadow-sm text-center">
             <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto" />
          </div>
        }>
          <VerifikasiEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
