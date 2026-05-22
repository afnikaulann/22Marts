require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Mengatur ulang tanggal pesanan (11 Mei - 20 Mei, maks 9/hari)...\n');
  
  const orders = await prisma.order.findMany({
    orderBy: { total: 'asc' }
  });

  console.log(`📦 Memproses ${orders.length} order...`);

  // Distribusi naik perlahan, puncak 9 di tanggal 20 Mei
  // Total: 5+6+7+7+8+8+9+9+9+9 = 77
  const distribution = [
    { date: '2026-05-11', count: 5 },
    { date: '2026-05-12', count: 6 },
    { date: '2026-05-13', count: 7 },
    { date: '2026-05-14', count: 7 },
    { date: '2026-05-15', count: 8 },
    { date: '2026-05-16', count: 8 },
    { date: '2026-05-17', count: 9 },
    { date: '2026-05-18', count: 9 },
    { date: '2026-05-19', count: 9 },
    { date: '2026-05-20', count: 9 }
  ];

  let orderIndex = 0;
  let counter = 0;

  for (const day of distribution) {
    for (let i = 0; i < day.count; i++) {
      if (orderIndex >= orders.length) break;
      
      const order = orders[orderIndex];
      
      const jam = Math.floor(Math.random() * 14) + 8;
      const menit = Math.floor(Math.random() * 60);
      const detik = Math.floor(Math.random() * 60);
      
      const newDate = new Date(`${day.date}T${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}.000+08:00`);
      
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
  console.log('📈 Distribusi pesanan per hari:');
  distribution.forEach(d => console.log(`   ${d.date} → ${d.count} pesanan`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
