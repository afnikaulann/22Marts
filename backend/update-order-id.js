const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany();
  let updatedCount = 0;

  for (const order of orders) {
    const parts = order.orderId.split('-');
    // Check if the sequence part has 4 digits
    if (parts.length === 3 && parts[2].length === 4) {
      const seq = parseInt(parts[2], 10);
      const newSeq = String(seq).padStart(3, '0');
      const newOrderId = `${parts[0]}-${parts[1]}-${newSeq}`;

      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { orderId: newOrderId }
        });
        console.log(`Updated ${order.orderId} to ${newOrderId}`);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update ${order.orderId}:`, error);
      }
    }
  }

  console.log(`Berhasil mengubah format ${updatedCount} pesanan menjadi 3 digit.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
