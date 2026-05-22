require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🔄 Mengatur ulang quantity agar maksimal 2 per produk...\n');

  // Ambil semua order items yang qty-nya lebih dari 2
  const itemsToFix = await prisma.orderItem.findMany({
    where: { quantity: { gt: 2 } }
  });

  console.log(`📦 Ditemukan ${itemsToFix.length} item dengan quantity > 2\n`);

  let fixed = 0;
  for (const item of itemsToFix) {
    const newQty = randomInt(1, 2); // acak antara 1 atau 2
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: newQty }
    });
    fixed++;
    process.stdout.write(`\r   ✏️  Progres: ${fixed}/${itemsToFix.length} item`);
  }

  // Sinkronisasi ulang total semua pesanan
  console.log('\n\n🔄 Sinkronisasi ulang total harga semua pesanan...');
  const allOrders = await prisma.order.findMany({ include: { items: true } });

  let synced = 0;
  for (const order of allOrders) {
    const newSubtotal = order.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    await prisma.order.update({
      where: { id: order.id },
      data: { subtotal: newSubtotal, total: newSubtotal }
    });
    synced++;
  }

  console.log(`\n✅ Selesai!`);
  console.log(`   ✏️  Item diupdate        : ${fixed}`);
  console.log(`   🔄 Pesanan di-sinkronisasi : ${synced}`);
  console.log('\n🎉 Semua quantity sudah maksimal 2 per produk!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
