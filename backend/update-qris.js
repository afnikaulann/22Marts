require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memulai update metode pembayaran agar dominan QRIS...\n');
  const orders = await prisma.order.findMany();
  let qrisCount = 0;
  let otherCount = 0;

  let count = 0;
  for (const order of orders) {
    // 85% kemungkinan menggunakan QRIS
    const isQris = Math.random() < 0.85;
    const paymentType = isQris ? 'qris' : (Math.random() < 0.5 ? 'bank_transfer' : 'gopay');
    
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentType }
    });

    if (isQris) qrisCount++;
    else otherCount++;

    count++;
    process.stdout.write(`\r   ✏️  Progres: ${count}/${orders.length} pesanan`);
  }

  console.log('\n\n✅ Update selesai!');
  console.log(`   💳 Total menggunakan QRIS         : ${qrisCount} pesanan`);
  console.log(`   💳 Total menggunakan Transfer/dll : ${otherCount} pesanan`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
