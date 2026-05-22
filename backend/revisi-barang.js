require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const KATA_TERLARANG = [
  'kipas', 'setrika', 'kompor', 'blender', 'oven', 'wajan', 'panci', 
  'dispenser', 'magic com', 'magic jar', 'kettle', 'rak', 'lemari', 
  'main', 'snooker', 'rice bucket', 'langseng', 'termos'
];

function isTerlarang(name, price) {
  const nameLower = name.toLowerCase();
  // Cek kata terlarang
  for (const kata of KATA_TERLARANG) {
    if (nameLower.includes(kata)) return true;
  }
  // Cek jika harga terlalu mahal (> 100rb) dan bukan barang wajar (seperti beras/susu/popok)
  if (price >= 100000) {
    if (!nameLower.includes('beras') && 
        !nameLower.includes('susu') && 
        !nameLower.includes('popok') && 
        !nameLower.includes('mamy') && 
        !nameLower.includes('sweety') &&
        !nameLower.includes('merries') &&
        !nameLower.includes('sgm') &&
        !nameLower.includes('bmt') &&
        !nameLower.includes('chil') &&
        !nameLower.includes('pediasure') &&
        !nameLower.includes('minyak')) {
      return true;
    }
  }
  return false;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🔄 Memeriksa pesanan yang mengandung barang elektronik/mahal...\n');

  // Ambil produk aman (makanan/minuman wajar < 50rb)
  const safeProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      price: { lte: 50000 }
    }
  });

  // Filter produk aman dari kata terlarang untuk berjaga-jaga
  const reallySafeProducts = safeProducts.filter(p => !isTerlarang(p.name, p.price));

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } }
  });

  let pesananDirevisi = 0;
  let barangDihapus = 0;

  for (const order of orders) {
    let butuhRevisi = false;
    let itemsToCreate = [];

    // Cek item di order
    for (const item of order.items) {
      if (isTerlarang(item.product.name, item.product.price)) {
        butuhRevisi = true;
        barangDihapus++;
        
        // Hapus item lama dari DB
        await prisma.orderItem.delete({ where: { id: item.id } });

        // Siapkan item pengganti yang aman
        const ganti = randomItem(reallySafeProducts);
        itemsToCreate.push({
          orderId: order.id,
          productId: ganti.id,
          quantity: randomInt(1, 3),
          price: ganti.price
        });
        
        console.log(`   ❌ Dihapus: ${item.product.name} (Rp ${item.product.price}) dari Order ${order.orderId}`);
        console.log(`   ✅ Diganti: ${ganti.name} (Rp ${ganti.price})`);
      }
    }

    if (butuhRevisi) {
      pesananDirevisi++;
      
      // Tambahkan item pengganti ke DB
      for (const newIt of itemsToCreate) {
        await prisma.orderItem.create({ data: newIt });
      }

      // Hitung ulang total untuk order ini
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true }
      });

      const newSubtotal = updatedOrder.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          subtotal: newSubtotal,
          total: newSubtotal // discount 0
        }
      });
    }
  }

  // Sebagai langkah pamungkas, pastikan semua order di-sync subtotalnya (hanya untuk berjaga-jaga)
  console.log('\n🔄 Sinkronisasi ulang total harga semua pesanan...');
  const allOrdersFinal = await prisma.order.findMany({ include: { items: true }});
  let synced = 0;
  for (const ord of allOrdersFinal) {
    const trueSubtotal = ord.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    if (ord.subtotal !== trueSubtotal || ord.total !== trueSubtotal) {
      await prisma.order.update({
        where: { id: ord.id },
        data: { subtotal: trueSubtotal, total: trueSubtotal }
      });
      synced++;
    }
  }

  console.log('\n\n✅ Revisi selesai!');
  console.log(`   🛒 Total pesanan direvisi : ${pesananDirevisi}`);
  console.log(`   🗑️  Barang mahal dihapus  : ${barangDihapus}`);
  console.log(`   🔄 Total di-sinkronisasi  : ${synced}`);
  console.log(`\n🎉 Semua transaksi kini terlihat jauh lebih masuk akal!\n`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
