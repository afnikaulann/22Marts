import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  Target,
  Rocket,
  Clock,
  Heart
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-8 lg:py-12 border-b border-slate-100">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Tentang Kami
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Mengenal lebih dekat perjalanan 22Mart dalam menghadirkan kemudahan belanja harian Anda.
            </p>
          </div>
        </section>

        {/* Cerita Kami Section */}
        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-none bg-white border border-slate-200 shadow-sm">
              <div className="grid lg:grid-cols-2 items-stretch">
                {/* Image Side */}
                <div className="relative aspect-square lg:aspect-auto lg:h-full bg-white">
                  <Image
                    src="/profil.png"
                    alt="Outlet 22Mart"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                {/* Text Side */}
                <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="h-6 w-1.5 bg-sky-500 rounded-full" />
                    Cerita Kami
                  </h2>
                  
                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed sm:text-base">
                    <p>
                      Berawal dari kehadiran outlet fisik kami yang ikonik di <span className="font-bold text-slate-700">jln. poros limbung-takalar bontotangnga</span>, <span className="font-bold text-sky-600">22Mart</span> didirikan oleh <span className="font-bold text-sky-600">Bapak Syamsurizal S.Si.T , M.Mar.Eng.</span> pada <span className="font-bold text-sky-600">22 Februari 2025</span> sebagai langkah inovatif dalam menghadirkan kemudahan berbelanja kebutuhan harian di era digital. Kami memahami bahwa kepercayaan adalah segalanya, itulah mengapa kami menggabungkan kualitas layanan toko fisik dengan kepraktisan belanja online.
                    </p>
                    <p>
                      Sejak awal berdirinya, 22Mart berkomitmen untuk menjadi solusi utama bagi masyarakat dalam memenuhi berbagai kebutuhan harian, mulai dari bahan pokok, makanan segar, hingga perlengkapan rumah tangga. Dengan dukungan teknologi dan layanan antar yang sigap, kami memastikan setiap pesanan Anda sampai dalam kondisi terbaik.
                    </p>
                    <p>
                      Perjalanan 22Mart adalah tentang dedikasi untuk terus berkembang dan memberikan yang terbaik bagi Anda. Dengan fokus penuh pada kepuasan pelanggan, kami bertekad menjadi supermarket online terpercaya yang selalu bisa diandalkan oleh setiap keluarga.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-medium text-slate-500 italic">"Belanja mudah, hidup lebih berkualitas."</p>
                    <Button size="sm" className="rounded-full bg-sky-500 px-5 font-semibold text-white hover:bg-sky-600 shadow-lg shadow-sky-200" asChild>
                      <Link href="/produk">
                        Mulai Belanja
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visi & Misi Section */}
        <section className="py-10 lg:py-14 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Visi Card */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-1 bg-sky-500 rounded-full" />
                  <h3 className="text-xl font-bold text-slate-800">Visi Kami</h3>
                </div>
                <p className="text-base text-slate-600 leading-relaxed italic border-l-4 border-sky-100 pl-4 py-1">
                  "Menjadi platform belanja online terpercaya yang menghadirkan kemudahan dan solusi belanja cerdas bagi setiap keluarga di Indonesia."
                </p>
              </div>

              {/* Misi Card */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-1 bg-sky-500 rounded-full" />
                  <h3 className="text-xl font-bold text-slate-800">Misi Kami</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: Rocket, text: "Memberikan kemudahan berbelanja melalui integrasi teknologi inovatif." },
                    { icon: ShieldCheck, text: "Menyediakan produk berkualitas tinggi yang telah melalui seleksi ketat." },
                    { icon: Heart, text: "Memberikan pelayanan terbaik, responsif, dan mengutamakan kepuasan pelanggan." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm sm:text-base text-slate-600 leading-snug">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
