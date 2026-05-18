import Link from "next/link";
import Image from "next/image";
import { Star, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            <Link href="/">
              <Image
                src="/logobaru.png"
                alt="22Mart"
                width={140}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 max-w-xs mx-auto text-justify">
              Supermarket online terpercaya dengan produk segar berkualitas untuk memenuhi kebutuhan harian Anda.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:grid-cols-2">
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-slate-900">Belanja</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li><Link href="/produk" className="transition-colors hover:text-sky-600">Semua Produk</Link></li>
                <li><Link href="/categories" className="transition-colors hover:text-sky-600">Kategori Pilihan</Link></li>
                <li><Link href="/deals" className="transition-colors hover:text-sky-600">Promo Menarik</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center text-center">
              <h3 className="font-semibold text-slate-900">Tentang Kami</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li><Link href="/about" className="transition-colors hover:text-sky-600">Profil 22Mart</Link></li>
                <li>
                  <a href="https://wa.me/6282292229500" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-sky-600">
                    0822-9222-9500
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/6282292229550" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-sky-600">
                    0822-9222-9550
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/22martgowa" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-sky-600">
                    IG: 22martgowa
                  </a>
                </li>
                <li>
                  <a href="https://tiktok.com/@22margowaa" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-sky-600">
                    TikTok: 22margowaa
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} 22Mart. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="transition-colors hover:text-slate-900">Kebijakan Privasi</Link>
            <Link href="/terms" className="transition-colors hover:text-slate-900">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
