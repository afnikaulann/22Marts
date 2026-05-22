const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memperbarui 2 nomor HP terakhir...');
  
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' }
  });

  if (orders.length >= 50) {
    // Index 48 = pembeli ke 49
    await prisma.order.update({
      where: { id: orders[48].id },
      data: { shippingPhone: "081355412983" }
    });
    console.log('✅ Nomor HP pembeli ke-49 diperbarui menjadi 081355412983');

    // Index 49 = pembeli ke 50
    await prisma.order.update({
      where: { id: orders[49].id },
      data: { shippingPhone: "085242771092" }
    });
    console.log('✅ Nomor HP pembeli ke-50 diperbarui menjadi 085242771092');
  } else {
    console.log('⚠️ Jumlah pesanan kurang dari 50, tidak dapat menemukan 2 pembeli terakhir secara akurat.');
  }

  console.log(`\n✅ Selesai memperbarui 2 nomor HP terakhir!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
