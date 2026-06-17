import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Syarat & Ketentuan</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Pendahuluan</h2>
                <p>
                  Selamat datang di 22Mart. Dengan mengakses dan menggunakan layanan kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan berikut. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak diperkenankan untuk menggunakan layanan kami.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Penggunaan Layanan</h2>
                <p>
                  Layanan kami ditujukan untuk pembelian produk kebutuhan harian secara online. Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan password Anda. Setiap aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Pemesanan dan Pembayaran</h2>
                <p>
                  Semua pesanan tergantung pada ketersediaan stok. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Pembayaran harus dilakukan melalui metode yang tersedia di platform kami.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Pengiriman</h2>
                <p>
                  Kami berusaha untuk mengirimkan pesanan Anda tepat waktu. Waktu pengiriman yang tertera adalah estimasi dan dapat bervariasi tergantung pada lokasi dan kondisi operasional.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Pengembalian dan Pembatalan</h2>
                <p>
                  Kebijakan pengembalian produk berlaku untuk barang yang rusak atau tidak sesuai dengan pesanan. Silakan hubungi layanan pelanggan kami dalam waktu 24 jam setelah menerima pesanan untuk klaim pengembalian.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Perubahan Ketentuan</h2>
                <p>
                  22Mart berhak untuk mengubah atau memperbarui Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan Anda atas layanan kami setelah perubahan tersebut merupakan persetujuan Anda terhadap ketentuan baru.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
