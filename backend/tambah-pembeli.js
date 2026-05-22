/**
 * TAMBAH 25 PEMBELI BARU + TRANSAKSI
 * ====================================
 * Skrip ini menambahkan 25 akun pembeli baru
 * beserta data transaksi selama 7 hari terakhir.
 *
 * Cara menjalankan:
 *   node tambah-pembeli.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// DATA 25 PEMBELI BARU
// ─────────────────────────────────────────────
const PEMBELI_BARU = [
  { name: 'Muhammad Fadly Mahmud',  email: 'fadly.mahmud99@gmail.com',      phone: '081242334901', jalan: 'Jl. Poros Limbung No. 88, Bontosunggu' },
  { name: 'Resky Amalia Putri',     email: 'reskyamalia.putri@gmail.com',   phone: '085255441982', jalan: 'Jl. Poros Takalar No. 14, Bajeng' },
  { name: 'Anwar Sidiq Pratama',    email: 'anwar.sidiq24@gmail.com',       phone: '082199324011', jalan: 'Jl. Mawar No. 3, Bontosunggu' },
  { name: 'Irma Suryani',           email: 'irma.suryani99@gmail.com',      phone: '085340123567', jalan: 'Jl. Poros Limbung No. 22, Bajeng' },
  { name: 'Syamsul Daeng Ngade',    email: 'syamsul.ngade22@gmail.com',     phone: '081355678123', jalan: 'Jl. Kartini No. 17, Bontosunggu' },
  { name: 'Nursanti Daeng Nurang',  email: 'nursanti.nurang@gmail.com',     phone: '082347890145', jalan: 'Jl. Poros Takalar No. 31, Bajeng' },
  { name: 'Muhammad Arif',          email: 'arif.muhammad12@gmail.com',     phone: '089532145678', jalan: 'Jl. Melati No. 5, Bontosunggu' },
  { name: 'Indah Sari Ramli',       email: 'indahsari.ramli@gmail.com',     phone: '085299012345', jalan: 'Jl. Poros Limbung No. 47, Bajeng' },
  { name: 'Faisal Basri',           email: 'faisal.basri95@gmail.com',      phone: '081241122334', jalan: 'Jl. Dahlia No. 9, Bontosunggu' },
  { name: 'Hasnawati Siregar',      email: 'hasnawati.srg@gmail.com',       phone: '085394567890', jalan: 'Jl. Poros Takalar No. 8, Bajeng' },
  { name: 'Ridwan Marhaban',        email: 'ridwan.marhaban@gmail.com',     phone: '082188776655', jalan: 'Jl. Anggrek No. 12, Bontosunggu' },
  { name: 'Anti Kartika',           email: 'anti.kartika22@gmail.com',      phone: '089655443321', jalan: 'Jl. Poros Limbung No. 60, Bajeng' },
  { name: 'Akbar Pratama',          email: 'akbar.pratama98@gmail.com',     phone: '081342110099', jalan: 'Jl. Flamboyan No. 4, Bontosunggu' },
  { name: 'Mega Utami Lestari',     email: 'megautami.lestari@gmail.com',   phone: '085240998877', jalan: 'Jl. Poros Takalar No. 19, Bajeng' },
  { name: 'Hendra Wijaya Putra',    email: 'hendrawijaya.putra@gmail.com',  phone: '082355112233', jalan: 'Jl. Cempaka No. 6, Bontosunggu' },
  { name: 'Suci Ramadhani',         email: 'suci.ramadhani98@gmail.com',    phone: '081240554433', jalan: 'Jl. Poros Limbung No. 35, Bajeng' },
  { name: 'Yusuf Daeng Sila',       email: 'yusuf.sila88@gmail.com',        phone: '085341223344', jalan: 'Jl. Teratai No. 2, Bontosunggu' },
  { name: 'Dian Purnamasari',       email: 'dian.purnama97@gmail.com',      phone: '082190887766', jalan: 'Jl. Poros Takalar No. 42, Bajeng' },
  { name: 'Ilham Hidayat',          email: 'ilham.hidayat22@gmail.com',     phone: '089540112233', jalan: 'Jl. Kamboja No. 8, Bontosunggu' },
  { name: 'Fitriani Bakri',         email: 'fitriani.bakri99@gmail.com',    phone: '085255667788', jalan: 'Jl. Poros Limbung No. 71, Bajeng' },
  { name: 'Andi Wahyu Pratama',     email: 'andiwahyu.putra@gmail.com',     phone: '081355449900', jalan: 'Jl. Mawar No. 11, Bontosunggu' },
  { name: 'Asriani Asis',           email: 'asriani.asis96@gmail.com',      phone: '082340776655', jalan: 'Jl. Poros Takalar No. 25, Bajeng' },
  { name: 'Bahrul Ulum',            email: 'bahrul.ulum15@gmail.com',       phone: '081242665544', jalan: 'Jl. Melati No. 7, Bontosunggu' },
  { name: 'Murni Sari',             email: 'murnisari.putri@gmail.com',     phone: '085399221100', jalan: 'Jl. Poros Limbung No. 53, Bajeng' },
  { name: 'Zulkifli Ahmad',         email: 'zulkifli.ahmad22@gmail.com',    phone: '082187654321', jalan: 'Jl. Dahlia No. 15, Bontosunggu' },
];

const ALAMAT_LENGKAP = (jalan) =>
  `${jalan}, Bontosunggu, Bajeng, Kabupaten Gowa, Sulawesi Selatan 92152`;

const STATUS_LIST = ['DIPROSES', 'DIKIRIM', 'SELESAI', 'SELESAI', 'SELESAI'];
const PAYMENT_TYPES = ['bank_transfer', 'gopay', 'qris', 'dana'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

async function main() {
  console.log('🚀 Menambahkan 25 pembeli baru + transaksi...\n');

  // 1. Ambil semua produk aktif
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    select: { id: true, name: true, price: true },
  });

  if (products.length === 0) {
    console.error('❌ Tidak ada produk aktif di database!');
    process.exit(1);
  }

  console.log(`✅ Ditemukan ${products.length} produk aktif.\n`);

  // 2. Hash password
  const passwordHash = await argon2.hash('password123');

  // 3. Buat akun pembeli baru
  console.log('👥 Membuat akun pembeli baru...');
  const createdUsers = [];

  for (const p of PEMBELI_BARU) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (existing) {
      console.log(`   ⚠️  User ${p.email} sudah ada, digunakan kembali.`);
      createdUsers.push({ ...existing, phone: p.phone, jalan: p.jalan, namaLengkap: p.name });
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
    createdUsers.push({ ...user, phone: p.phone, jalan: p.jalan, namaLengkap: p.name });
    console.log(`   ✅ Dibuat: ${p.name} (${p.email})`);
  }

  // 4. Buat transaksi untuk pembeli baru
  console.log('\n🛒 Membuat transaksi untuk pembeli baru...');

  // Rata-rata 4-5 pesanan per orang baru = sekitar 100-125 pesanan tambahan
  const totalTransaksi = randomInt(100, 120);
  let berhasil = 0;
  let gagal = 0;

  for (let i = 0; i < totalTransaksi; i++) {
    const user = randomItem(createdUsers);
    const status = randomItem(STATUS_LIST);
    const paymentType = randomItem(PAYMENT_TYPES);
    const tanggal = randomDateInLastDays(7);

    const jumlahProduk = randomInt(1, 5);
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, jumlahProduk);

    const items = selectedProducts.map((p) => ({
      productId: p.id,
      quantity: randomInt(1, 4),
      price: p.price,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const orderId = generateOrderId();
      const idempotencyKey = `seed2-${Date.now()}-${i}-${Math.random()}`;

      await prisma.order.create({
        data: {
          orderId,
          idempotencyKey,
          status,
          subtotal,
          discount: 0,
          total: subtotal,
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
  console.log(`   📊 Pesanan baru berhasil dibuat : ${berhasil}`);
  console.log(`   ❌ Gagal                        : ${gagal}`);
  console.log(`   👥 Total pembeli baru            : ${createdUsers.length}`);
  console.log(`\n🎉 Kini total pembeli di database menjadi 50 orang!\n`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
