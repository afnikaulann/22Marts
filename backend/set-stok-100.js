require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Mengatur stok semua produk menjadi 100...\n');
  
  const result = await prisma.product.updateMany({
    data: { stock: 100 }
  });

  console.log(`✅ Selesai! Berhasil mengupdate ${result.count} produk.`);
  console.log('Semua produk di website kini memiliki stok 100.');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
