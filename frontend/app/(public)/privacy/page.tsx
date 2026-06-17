import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Kebijakan Privasi</h1>
            
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Informasi yang Kami Kumpulkan</h2>
                <p>
                  Kami mengumpulkan informasi pribadi yang Anda berikan kepada kami secara langsung saat mendaftar akun, melakukan pemesanan, atau menghubungi layanan pelanggan. Ini termasuk nama, alamat email, nomor telepon, dan alamat pengiriman.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Penggunaan Informasi</h2>
                <p>
                  Informasi yang kami kumpulkan digunakan untuk memproses pesanan Anda, memberikan layanan pelanggan, mengirimkan informasi terkait pesanan, dan (jika Anda setuju) mengirimkan promo atau berita terbaru dari 22Mart.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Perlindungan Informasi</h2>
                <p>
                  Kami mengambil langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses yang tidak sah, perubahan, atau penghancuran. Namun, harap diingat bahwa tidak ada metode transmisi melalui internet yang 100% aman.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Berbagi Informasi dengan Pihak Ketiga</h2>
                <p>
                  Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi informasi dengan mitra terpercaya yang membantu kami dalam mengoperasikan platform kami atau melakukan pengiriman pesanan Anda.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Hak Anda</h2>
                <p>
                  Anda memiliki hak untuk mengakses, memperbarui, atau meminta penghapusan informasi pribadi Anda yang kami simpan. Anda dapat melakukannya melalui pengaturan akun atau dengan menghubungi kami.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Cookies</h2>
                <p>
                  Kami menggunakan cookies untuk meningkatkan pengalaman Anda di situs kami, mengingat preferensi Anda, dan mengumpulkan data analitik anonim tentang penggunaan situs.
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
