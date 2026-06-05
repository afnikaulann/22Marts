const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ambil semua order dan urutkan berdasarkan waktu pembuatan dari yang tertua
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Ditemukan ${orders.length} pesanan. Memulai proses pembaruan ID...`);

  let currentCacheDate = '';
  let currentSequence = 0;
  let updatedCount = 0;

  for (const order of orders) {
    const d = new Date(order.createdAt);
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

    if (currentCacheDate !== dateStr) {
      currentCacheDate = dateStr;
      currentSequence = 1;
    } else {
      currentSequence++;
    }

    const newOrderId = `22MART-${dateStr}-${String(currentSequence).padStart(3, '0')}`;

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { orderId: newOrderId }
      });
      console.log(`Berhasil mengubah: ${order.orderId} => ${newOrderId}`);
      updatedCount++;
    } catch (error) {
      console.error(`Gagal mengubah ${order.orderId}:`, error);
    }
  }

  console.log(`Selesai! Berhasil memperbarui ${updatedCount} dari ${orders.length} pesanan.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
