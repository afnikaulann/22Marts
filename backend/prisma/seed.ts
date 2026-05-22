import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Daftar 25 Nama Responden dari Afni (Bisa diulang untuk jadi 50)
  const namaResponden = [
    { nama: "Muhammad Fadly Mahmud", email: "fadly.mahmud99@gmail.com", hp: "081242334901" },
    { nama: "Resky Amalia Putri", email: "reskyamalia.putri@gmail.com", hp: "085255441982" },
    { nama: "Anwar Sidiq Pratama", email: "anwar.sidiq24@gmail.com", hp: "082199324011" },
    { nama: "Irma Suryani", email: "irma.suryani99@gmail.com", hp: "085340123567" },
    { nama: "Syamsul Daeng Ngade", email: "syamsul.ngade22@gmail.com", hp: "081355678123" },
    { nama: "Nursanti Daeng Nurang", email: "nursanti.nurang@gmail.com", hp: "082347890145" },
    { nama: "Muhammad Arif", email: "arif.muhammad12@gmail.com", hp: "089532145678" },
    { nama: "Indah Sari Ramli", email: "indahsari.ramli@gmail.com", hp: "085299012345" },
    { nama: "Faisal Basri", email: "faisal.basri95@gmail.com", hp: "081241122334" },
    { nama: "Hasnawati Siregar", email: "hasnawati.srg@gmail.com", hp: "085394567890" },
    { nama: "Ridwan Marhaban", email: "ridwan.marhaban@gmail.com", hp: "082188776655" },
    { nama: "Anti Kartika", email: "anti.kartika22@gmail.com", hp: "089655443321" },
    { nama: "Akbar Pratama", email: "akbar.pratama98@gmail.com", hp: "081342110099" },
    { nama: "Mega Utami Lestari", email: "megautami.lestari@gmail.com", hp: "085240998877" },
    { nama: "Hendra Wijaya Putra", email: "hendrawijaya.putra@gmail.com", hp: "082355112233" },
    { nama: "Suci Ramadhani", email: "suci.ramadhani98@gmail.com", hp: "081240554433" },
    { nama: "Yusuf Daeng Sila", email: "yusuf.sila88@gmail.com", hp: "085341223344" },
    { nama: "Dian Purnamasari", email: "dian.purnama97@gmail.com", hp: "082190887766" },
    { nama: "Ilham Hidayat", email: "ilham.hidayat22@gmail.com", hp: "089540112233" },
    { nama: "Fitriani Bakri", email: "fitriani.bakri99@gmail.com", hp: "085255667788" },
    { nama: "Andi Wahyu Pratama", email: "andiwahyu.putra@gmail.com", hp: "081355449900" },
    { nama: "Asriani Asis", email: "asriani.asis96@gmail.com", hp: "082340776655" },
    { nama: "Bahrul Ulum", email: "bahrul.ulum15@gmail.com", hp: "081242665544" },
    { nama: "Murni Sari", email: "murnisari.putri@gmail.com", hp: "085399221100" },
    { nama: "Zulkifli Ahmad", email: "zulkifli.ahmad22@gmail.com", hp: "082187654321" },
  ];

  // Ambil data produk yang sudah ada di tokomu untuk direlasikan
  const products = await prisma.product.findMany();
  if (products.length < 3) {
    console.log("⚠️ Tolong isi minimal 3 produk dulu di web kamu via admin sebelum jalankan script ini.");
    return;
  }

  console.log("Menginput 50 akun dan transaksi simulasi...");

  // Aturan Sebaran Tanggal (Mulai 10 Mei 2026, max 7 per hari)
  const tanggalMulai = 10; 
  
  for (let i = 0; i < 50; i++) {
    // Mengulang daftar 25 nama agar menjadi 50 user unik (dibedakan dengan angka belakang email)
    const dataResponden = namaResponden[i % 25];
    const emailUnik = i >= 25 ? dataResponden.email.replace("@", "2@") : dataResponden.email;
    const namaUnik = i >= 25 ? `${dataResponden.nama} (Uji 2)` : dataResponden.nama;

    // Hitung tanggal agar sebarannya maksimal 7 pembeli per hari
    const tanggalHariIni = tanggalMulai + Math.floor(i / 7); 
    const tanggalTransaksi = new Date(`2026-05-${tanggalHariIni}T10:00:00.000Z`);

    // Aturan jumlah item: pembeli genap beli 2 produk, ganjil beli 3 produk (Maksimal 3, tidak ada yang 1)
    const jumlahJenisProduk = i % 2 === 0 ? 2 : 3;

    // 2. Insert User Baru ke Database
    const user = await prisma.user.create({
      data: {
        name: namaUnik,
        email: emailUnik,
        password: "password123", // Password seragam untuk testing kelompokmu
        role: "USER",
      },
    });

    // 3. Insert Transaksi/Order untuk User Tersebut
    const orderId = `ORD-202605${tanggalHariIni.toString().padStart(2, '0')}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;
    const order = await prisma.order.create({
      data: {
        orderId,
        idempotencyKey: `seed-${Date.now()}-${i}`,
        shippingName: namaUnik,
        shippingPhone: dataResponden.hp,
        shippingAddress: "Bontosunggu, Bajeng",
        subtotal: 0,
        total: 0,
        userId: user.id,
        status: "SELESAI",      // Status Selesai sesuai maumu
        paymentStatus: "settlement", // Status Lunas
        paymentType: "qris",  // Dominan QRIS 22Mart
        createdAt: tanggalTransaksi,
        updatedAt: tanggalTransaksi,
      },
    });

    // 4. Insert Detail Item yang Dibeli (Order Items)
    for (let j = 0; j < jumlahJenisProduk; j++) {
      const produkAcak = products[j % products.length]; // Mengambil produk variatif dari tokomu
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: produkAcak.id,
          quantity: Math.floor(Math.random() * 2) + 1, // Kuantitas acak 1 atau 2 pcs
          price: produkAcak.price,
        },
      });
    }
  }

  console.log("✅ Berhasil menginput 50 user dan transaksi teratur ke database!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });