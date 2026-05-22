require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.order.count();
  console.log('Total Orders di database:', count);
  
  if (count > 0) {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log('5 Order terbaru:');
    console.log(orders);
  }
}

main().finally(() => prisma.$disconnect());
