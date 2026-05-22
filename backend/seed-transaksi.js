/**
 * SEED TRANSAKSI 22MART GOWA
 * ===========================
 * Skrip ini akan membuat:
 * - 25 akun pembeli dummy dengan nama & alamat sekitar Bajeng, Gowa
 * - Ratusan transaksi pesanan selama 7 hari terakhir
 * - Status pesanan yang bervariasi (DIPROSES, DIKIRIM, SELESAI)
 *
 * Cara menjalankan:
 *   node seed-transaksi.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// DATA DUMMY PEMBELI (nama & alamat Gowa)
// ─────────────────────────────────────────────
const PEMBELI = [
  { name: 'Nurul Hidayah', email: 'nurul.hidayah22@gmail.com', phone: '082292110001', jalan: 'Jl. Poros Limbung No. 12, Bontosunggu' },
  { name: 'Ahmad Faisal', email: 'ahmad.faisal.gowa@gmail.com', phone: '082292110002', jalan: 'Jl. Masjid Raya No. 5, Bontosunggu' },
  { name: 'Siti Rahma', email: 'siti.rahma.bajeng@gmail.com', phone: '082292110003', jalan: 'Jl. Poros Takalar No. 7, Bontosunggu' },
  { name: 'Muhammad Rizky', email: 'm.rizky.limbung@gmail.com', phone: '082292110004', jalan: 'Jl. Poros Limbung No. 34, Bajeng' },
  { name: 'Fitriani Amir', email: 'fitriani.amir99@gmail.com', phone: '082292110005', jalan: 'Jl. Kartini No. 8, Bontosunggu' },
  { name: 'Wahyu Pratama', email: 'wahyu.pratama.gowa@gmail.com', phone: '082292110006', jalan: 'Jl. Poros Limbung No. 21, Bajeng' },
  { name: 'Rahmawati', email: 'rahmawati.bajeng@gmail.com', phone: '082292110007', jalan: 'Jl. Melati No. 3, Bontosunggu' },
  { name: 'Abdul Karim', email: 'a.karim.gowa@gmail.com', phone: '082292110008', jalan: 'Jl. Poros Limbung No. 56, Bajeng' },
  { name: 'Hasnawati', email: 'hasnawati.gowa@gmail.com', phone: '082292110009', jalan: 'Jl. Dahlia No. 11, Bontosunggu' },
  { name: 'Irfan Hakim', email: 'irfan.hakim.limbung@gmail.com', phone: '082292110010', jalan: 'Jl. Poros Takalar No. 18, Bajeng' },
  { name: 'Nur Aeni', email: 'nuraeni.bajeng@gmail.com', phone: '082292110011', jalan: 'Jl. Anggrek No. 2, Bontosunggu' },
  { name: 'Reski Amalia', email: 'reski.amalia22@gmail.com', phone: '082292110012', jalan: 'Jl. Poros Limbung No. 9, Bontosunggu' },
  { name: 'Burhanuddin', email: 'burhanuddin.gowa@gmail.com', phone: '082292110013', jalan: 'Jl. Mawar No. 6, Bajeng' },
  { name: 'Marlina Sari', email: 'marlina.sari.gowa@gmail.com', phone: '082292110014', jalan: 'Jl. Poros Limbung No. 44, Bontosunggu' },
  { name: 'Syarifuddin', email: 'syarifuddin.limbung@gmail.com', phone: '082292110015', jalan: 'Jl. Flamboyan No. 1, Bajeng' },
  { name: 'Nursyamsi', email: 'nursyamsi.bajeng@gmail.com', phone: '082292110016', jalan: 'Jl. Poros Takalar No. 29, Bontosunggu' },
  { name: 'Ruslan', email: 'ruslan.gowa22@gmail.com', phone: '082292110017', jalan: 'Jl. Poros Limbung No. 67, Bajeng' },
  { name: 'Sunarti', email: 'sunarti.bajeng99@gmail.com', phone: '082292110018', jalan: 'Jl. Teratai No. 4, Bontosunggu' },
  { name: 'Alamsyah', email: 'alamsyah.gowa@gmail.com', phone: '082292110019', jalan: 'Jl. Poros Limbung No. 13, Bontosunggu' },
  { name: 'Hartati', email: 'hartati.limbung@gmail.com', phone: '082292110020', jalan: 'Jl. Cempaka No. 7, Bajeng' },
  { name: 'Zulkifli', email: 'zulkifli.bajeng@gmail.com', phone: '082292110021', jalan: 'Jl. Poros Takalar No. 5, Bajeng' },
  { name: 'Aminah Saleh', email: 'aminah.saleh.gowa@gmail.com', phone: '082292110022', jalan: 'Jl. Poros Limbung No. 25, Bontosunggu' },
  { name: 'Hasrul', email: 'hasrul.gowa22@gmail.com', phone: '082292110023', jalan: 'Jl. Kamboja No. 9, Bajeng' },
  { name: 'Yusnidar', email: 'yusnidar.limbung@gmail.com', phone: '082292110024', jalan: 'Jl. Poros Limbung No. 39, Bontosunggu' },
  { name: 'Saharuddin', email: 'saharuddin.bajeng@gmail.com', phone: '082292110025', jalan: 'Jl. Poros Takalar No. 11, Bajeng' },
];

const ALAMAT_LENGKAP = (jalan) =>
  `${jalan}, Bontosunggu, Bajeng, Kabupaten Gowa, Sulawesi Selatan 92152`;

const STATUS_LIST = ['DIPROSES', 'DIKIRIM', 'SELESAI', 'SELESAI', 'SELESAI']; // lebih banyak SELESAI agar terlihat nyata
const PAYMENT_TYPES = ['bank_transfer', 'gopay', 'qris', 'dana'];

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Tanggal acak antara N hari yang lalu dan hari ini
function randomDateInLastDays(daysAgo) {
  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - daysAgo);
  const diff = now.getTime() - pastDate.getTime();
  return new Date(pastDate.getTime() + Math.random() * diff);
}

function generateOrderId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${dateStr}-${rand}`;
}

// ─────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────

async function main() {
  console.log('🚀 Memulai proses seeding transaksi 22Mart...\n');

  // 1. Ambil semua produk yang aktif dari database
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true, name: true, price: true },
  });

  if (products.length === 0) {
    console.error('❌ Tidak ada produk aktif di database! Pastikan produk sudah dimasukkan terlebih dahulu.');
    process.exit(1);
  }

  console.log(`✅ Ditemukan ${products.length} produk aktif di database.`);

  // 2. Hash password dummy (pakai argon2 sesuai backend)
  const passwordHash = await argon2.hash('password123');

  // 3. Buat akun pembeli dummy
  console.log('\n👥 Membuat akun pembeli dummy...');
  const createdUsers = [];

  for (const p of PEMBELI) {
    // Cek apakah user sudah ada
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (existing) {
      createdUsers.push(existing);
      console.log(`   ⚠️  User ${p.email} sudah ada, digunakan kembali.`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        password: passwordHash,
        role: 'USER',
      },
    });
    createdUsers.push({ ...user, phone: p.phone, jalan: p.jalan });
    console.log(`   ✅ Dibuat: ${p.name} (${p.email})`);
  }

  // Gabungkan data phone & jalan ke user yang sudah ada
  const usersWithDetail = createdUsers.map((u, i) => ({
    ...u,
    phone: PEMBELI[i]?.phone || '082292110000',
    jalan: PEMBELI[i]?.jalan || 'Jl. Poros Limbung No. 1, Bontosunggu',
    namaLengkap: PEMBELI[i]?.name || u.name,
  }));

  // 4. Buat transaksi dummy
  console.log('\n🛒 Membuat data transaksi selama 7 hari terakhir...');

  // Total transaksi: antara 80-120 transaksi dalam seminggu
  const totalTransaksi = randomInt(85, 120);
  let berhasil = 0;
  let gagal = 0;

  for (let i = 0; i < totalTransaksi; i++) {
    const user = randomItem(usersWithDetail);
    const status = randomItem(STATUS_LIST);
    const paymentType = randomItem(PAYMENT_TYPES);
    const tanggal = randomDateInLastDays(7);

    // Pilih 1-5 produk secara acak untuk setiap pesanan
    const jumlahProduk = randomInt(1, 5);
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, jumlahProduk);

    // Hitung subtotal
    const items = selectedProducts.map((p) => ({
      productId: p.id,
      quantity: randomInt(1, 4),
      price: p.price,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal; // tanpa diskon

    try {
      const orderId = generateOrderId();
      const idempotencyKey = `seed-${Date.now()}-${i}-${Math.random()}`;

      await prisma.order.create({
        data: {
          orderId,
          idempotencyKey,
          status,
          subtotal,
          discount: 0,
          total,
          shippingName: user.namaLengkap || user.name,
          shippingPhone: user.phone,
          shippingAddress: ALAMAT_LENGKAP(user.jalan),
          paymentStatus: status === 'DIPROSES' ? 'pending' : 'settlement',
          paymentType,
          userId: user.id,
          createdAt: tanggal,
          updatedAt: tanggal,
          items: {
            create: items,
          },
        },
      });

      berhasil++;
      process.stdout.write(`\r   📦 Progres: ${berhasil + gagal}/${totalTransaksi} pesanan`);
    } catch (err) {
      gagal++;
    }
  }

  console.log(`\n\n✅ Selesai!`);
  console.log(`   📊 Total pesanan berhasil dibuat : ${berhasil}`);
  console.log(`   ❌ Gagal (jika ada duplikat)    : ${gagal}`);
  console.log(`   👥 Akun pembeli                 : ${usersWithDetail.length}`);
  console.log(`\n🎉 Data transaksi seminggu 22Mart Gowa sudah masuk ke database!`);
  console.log(`   Silakan cek Dashboard Admin Anda untuk melihat hasilnya.\n`);
}

main()
  .catch((e) => {
    console.error('\n❌ Terjadi error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
