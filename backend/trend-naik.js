require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Mengatur ulang tanggal pesanan agar grafik tren meningkat...\n');
  
  // 1. Ambil semua order, urutkan dari total belanja terkecil ke terbesar
  // Agar pendapatan harian juga terjamin selalu naik secara konsisten
  const orders = await prisma.order.findMany({
    orderBy: { total: 'asc' }
  });

  console.log(`📦 Memproses ${orders.length} order...`);

  // 2. Tentukan distribusi pesanan dari tanggal 15 Mei hingga 21 Mei 2026
  // Jumlah pesanan dibuat semakin banyak setiap harinya (Total 77)
  const distribution = [
    { date: '2026-05-15', count: 4 },
    { date: '2026-05-16', count: 6 },
    { date: '2026-05-17', count: 8 },
    { date: '2026-05-18', count: 10 },
    { date: '2026-05-19', count: 13 },
    { date: '2026-05-20', count: 16 },
    { date: '2026-05-21', count: 20 } // Hari ini paling ramai!
  ];

  let orderIndex = 0;
  let counter = 0;

  for (const day of distribution) {
    for (let i = 0; i < day.count; i++) {
      if (orderIndex >= orders.length) break;
      
      const order = orders[orderIndex];
      
      // Acak jam antara 08:00 sampai 21:00
      const jam = Math.floor(Math.random() * 14) + 8;
      const menit = Math.floor(Math.random() * 60);
      const detik = Math.floor(Math.random() * 60);
      
      const newDate = new Date(`${day.date}T${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}.000+08:00`);
      
      // Sesuaikan Order ID dengan tanggal baru
      const dateStr = day.date.replace(/-/g, '');
      const newOrderId = `ORD-${dateStr}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderId: newOrderId,
          createdAt: newDate,
          updatedAt: newDate
        }
      });

      orderIndex++;
      counter++;
      process.stdout.write(`\r   ✏️  Diupdate: ${counter}/${orders.length} order`);
    }
  }

  console.log(`\n\n✅ Selesai!`);
  console.log(`📈 Grafik pendapatan & pesanan sekarang sudah disetel agar terus MENINGKAT tajam dari tanggal 15 Mei hingga puncaknya hari ini (21 Mei).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
