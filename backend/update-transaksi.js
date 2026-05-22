/**
 * UPDATE SEMUA TRANSAKSI - TANGGAL, STATUS, PEMBAYARAN
 * =====================================================
 * Yang dilakukan skrip ini:
 * 1. Atur ulang tanggal pesanan: 10–21 Mei 2026 (12 hari)
 * 2. Generate ulang nomor pesanan sesuai tanggal
 * 3. Semua status → SELESAI
 * 4. Semua paymentStatus → "settlement" (tampil "Lunas" di web)
 * 5. paymentType diacak: qris dan virtual_account
 *
 * Cara menjalankan:
 *   node update-transaksi.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 12 hari: 10–21 Mei 2026
const TANGGAL_MULAI = new Date('2026-05-10T00:00:00+08:00');
const TOTAL_HARI = 12;

const PAYMENT_TYPES = [
  'qris',
  'qris',
  'bank_transfer', // virtual account
  'bank_transfer',
  'qris',
  'bank_transfer',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate jam acak antara 07:00 – 21:00
function randomTime(tanggal) {
  const jam = Math.floor(Math.random() * 14) + 7; // 7 - 20
  const menit = Math.floor(Math.random() * 60);
  const detik = Math.floor(Math.random() * 60);

  const d = new Date(tanggal);
  d.setHours(jam, menit, detik, 0);
  return d;
}

async function main() {
  console.log('🔄 Memulai update transaksi...\n');

  // Ambil semua pesanan
  const semuaPesanan = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, orderId: true },
  });

  const total = semuaPesanan.length;
  console.log(`📦 Total pesanan ditemukan: ${total}\n`);

  // Bagi pesanan merata ke 12 hari
  const pesananPerHari = Math.ceil(total / TOTAL_HARI);

  let counter = 0;
  let berhasil = 0;

  // Buat daftar tanggal dan urutan nomor per hari
  const hariCounter = {}; // { '20260510': 1, '20260511': 1, ... }

  for (let i = 0; i < total; i++) {
    const pesanan = semuaPesanan[i];

    // Tentukan hari ke berapa (0–11)
    const hariKe = Math.min(Math.floor(i / pesananPerHari), TOTAL_HARI - 1);

    // Hitung tanggal
    const tanggal = new Date(TANGGAL_MULAI);
    tanggal.setDate(tanggal.getDate() + hariKe);

    // Format tanggal untuk orderId: YYYYMMDD
    const year = tanggal.getFullYear();
    const month = String(tanggal.getMonth() + 1).padStart(2, '0');
    const day = String(tanggal.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Nomor urut per hari
    if (!hariCounter[dateStr]) hariCounter[dateStr] = 1;
    const nomorUrut = String(hariCounter[dateStr]).padStart(5, '0');
    hariCounter[dateStr]++;

    const orderId = `ORD-${dateStr}-${nomorUrut}`;
    const waktuTransaksi = randomTime(tanggal);
    const paymentType = randomItem(PAYMENT_TYPES);

    try {
      await prisma.order.update({
        where: { id: pesanan.id },
        data: {
          orderId,
          status: 'SELESAI',
          paymentStatus: 'settlement', // tampil "Lunas" di web
          paymentType,
          createdAt: waktuTransaksi,
          updatedAt: waktuTransaksi,
        },
      });
      berhasil++;
    } catch (err) {
      // Jika orderId duplikat, coba dengan suffix random
      try {
        const suffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        await prisma.order.update({
          where: { id: pesanan.id },
          data: {
            orderId: `ORD-${dateStr}-${nomorUrut}-${suffix}`,
            status: 'SELESAI',
            paymentStatus: 'settlement',
            paymentType,
            createdAt: waktuTransaksi,
            updatedAt: waktuTransaksi,
          },
        });
        berhasil++;
      } catch (err2) {
        console.log(`\n   ⚠️  Gagal update pesanan ${pesanan.orderId}: ${err2.message}`);
      }
    }

    counter++;
    process.stdout.write(`\r   ✏️  Progres: ${counter}/${total} pesanan`);
  }

  console.log(`\n\n✅ Selesai!`);
  console.log(`   📊 Berhasil diupdate : ${berhasil} pesanan`);
  console.log(`   📅 Rentang tanggal   : 10 Mei 2026 – 21 Mei 2026`);
  console.log(`   💳 Status pembayaran : Lunas (settlement)`);
  console.log(`   ✅ Status pesanan    : SELESAI semua`);
  console.log(`   📱 Metode bayar      : QRIS & Virtual Account`);
  console.log(`\n🎉 Dashboard Admin sudah siap untuk presentasi!\n`);

  // Tampilkan ringkasan per hari
  console.log('📋 Ringkasan pesanan per hari:');
  for (const [tgl, jumlah] of Object.entries(hariCounter)) {
    const tahun = tgl.slice(0, 4);
    const bln = tgl.slice(4, 6);
    const hr = tgl.slice(6, 8);
    console.log(`   ${hr}/${bln}/${tahun} → ${jumlah - 1} pesanan`);
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
