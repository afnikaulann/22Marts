const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'apnikaulan@gmail.com';

  const user = await prisma.user.findUnique({
    where: { email },
    include: { orders: { include: { items: true } } }
  });

  if (!user) {
    console.log('User tidak ditemukan!');
    return;
  }

  console.log(`Ditemukan user ${user.name} dengan ${user.orders.length} pesanan.`);

  let totalDikembalikan = 0;
  for (const order of user.orders) {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
      totalDikembalikan += item.quantity;
    }
  }
  console.log(`Berhasil mengembalikan ${totalDikembalikan} item stok.`);

  await prisma.user.delete({
    where: { id: user.id }
  });
  console.log('User dan seluruh pesanannya berhasil dihapus.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
