require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration
const START_DATE = new Date('2026-05-10T08:00:00+08:00'); // start at 8am
const END_DATE = new Date('2026-05-20T20:00:00+08:00');   // end at 8pm
const MAX_BUYERS_PER_DAY = 7;
const MIN_PRODUCTS_PER_ORDER = 2;
const MAX_PRODUCTS_PER_ORDER = 3;

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Random time between 8:00 and 20:00 on a given day
function randomTimeOn(date) {
  const hour = Math.floor(Math.random() * 13) + 8; // 8..20
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  const d = new Date(date);
  d.setHours(hour, minute, second, 0);
  return d;
}

async function main() {
  console.log('🔄 Memperbarui semua order agar memenuhi batasan yang diminta...\n');

  // 1. Ambil semua produk yang "aman" (harga <= 50000 dan tidak mengandung kata terlarang)
  const KATA_TERLARANG = [
    'kipas','setrika','kompor','blender','oven','wajan','panci','dispenser','magic com','magic jar','kettle','rak','lemari','main','snooker','rice bucket','langseng','termos','sapu','termometer'
  ];
  const safeProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      price: { lte: 50000 }
    }
  });
  const reallySafe = safeProducts.filter(p => !KATA_TERLARANG.some(k => p.name.toLowerCase().includes(k)));
  if (reallySafe.length < 5) throw new Error('Tidak cukup produk aman untuk diganti');

  // 2. Ambil semua orders beserta itemsnya
  const orders = await prisma.order.findMany({
    include: { items: true }
  });
  console.log(`📦 Ditemukan ${orders.length} order.`);

  // 3. Distribusi tanggal
  const dateCounts = {}; // map tanggal (YYYY-MM-DD) -> count
  const dates = [];
  for (let d = new Date(START_DATE); d <= END_DATE; d.setDate(d.getDate() + 1)) {
    const key = formatDate(d);
    dateCounts[key] = 0;
    dates.push(new Date(d));
  }

  // Shuffle orders to randomize distribution
  const shuffled = orders.sort(() => Math.random() - 0.5);

  for (const order of shuffled) {
    // Find a date with capacity
    let assignedDate = null;
    for (const d of dates) {
      const key = formatDate(d);
      if (dateCounts[key] < MAX_BUYERS_PER_DAY) {
        assignedDate = new Date(d);
        dateCounts[key]++;
        break;
      }
    }
    if (!assignedDate) {
      // fallback: just use last date (should not happen with 50 buyers)
      assignedDate = new Date(END_DATE);
    }

    const tanggalTransaksi = randomTimeOn(assignedDate);

    // 4. Pastikan jumlah produk per order antara MIN dan MAX
    let currentItems = order.items;
    // Jika kurang dari MIN, tambahkan produk random
    while (currentItems.length < MIN_PRODUCTS_PER_ORDER) {
      const prod = reallySafe[Math.floor(Math.random() * reallySafe.length)];
      const newItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          quantity: Math.floor(Math.random() * 2) + 1, // 1-2
          price: prod.price
        }
      });
      currentItems = [...currentItems, newItem];
    }
    // Jika lebih dari MAX, hapus yang berlebih (random)
    while (currentItems.length > MAX_PRODUCTS_PER_ORDER) {
      const toRemove = currentItems.pop();
      await prisma.orderItem.delete({ where: { id: toRemove.id } });
    }

    // 5. Hitung subtotal & total ulang
    const newSubtotal = currentItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // 6. Update order tanggal, subtotal, total, status tetap SELESAI, paymentStatus = 'settlement', paymentType tetap QRIS (atau random)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        createdAt: tanggalTransaksi,
        updatedAt: tanggalTransaksi,
        subtotal: newSubtotal,
        total: newSubtotal,
        // pastikan status tetap SELESAI dan paymentStatus Lunas
        status: 'SELESAI',
        paymentStatus: 'settlement',
        paymentType: 'qris'
      }
    });
  }

  console.log('\n✅ Semua order berhasil disesuaikan dengan aturan:');
  console.log(`   • Maksimal ${MAX_BUYERS_PER_DAY} pembeli per hari (10‑20 Mei 2026)`);
  console.log(`   • 2‑3 produk per order`);
  console.log(`   • Semua status SELESAI & pembayaran Lunas (QRIS)`);
}

main()
  .catch(e => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
