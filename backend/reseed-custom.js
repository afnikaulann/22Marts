const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Menghapus data pesanan lama...');
  // Hapus semua data orderItem dan order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  console.log('✅ Pesanan lama dihapus. Membuat 50 pesanan baru...');

  // Ambil users (diasumsikan sudah ada dari seed.ts atau kita ambil 50 user pertama yang bukan admin)
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    take: 50
  });

  if (users.length === 0) {
    console.log('❌ Tidak ada user untuk pesanan!');
    return;
  }

  // Ambil produk, filter yang harganya kurang dari 130000 agar aman
  const products = await prisma.product.findMany({
    where: { price: { lt: 100000 } }
  });

  if (products.length === 0) {
    console.log('❌ Tidak ada produk dengan harga di bawah 100rb!');
    return;
  }

  // Distribusi 50 pesanan (14 Mei - 20 Mei)
  // Total = 3 + 4 + 6 + 7 + 9 + 10 + 11 = 50
  const distribution = [
    { date: '2026-05-14', count: 3 },
    { date: '2026-05-15', count: 4 },
    { date: '2026-05-16', count: 6 },
    { date: '2026-05-17', count: 7 },
    { date: '2026-05-18', count: 9 },
    { date: '2026-05-19', count: 10 },
    { date: '2026-05-20', count: 11 }
  ];

  let userIndex = 0;
  let counter = 0;

  for (const day of distribution) {
    for (let i = 0; i < day.count; i++) {
      // Ambil user
      const user = users[userIndex % users.length];
      
      // Waktu acak antara 08:00 - 21:00
      const jam = Math.floor(Math.random() * 14) + 8;
      const menit = Math.floor(Math.random() * 60);
      const detik = Math.floor(Math.random() * 60);
      
      const orderDate = new Date(`${day.date}T${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}.000+08:00`);
      
      const dateStr = day.date.replace(/-/g, '');
      const orderIdStr = `ORD-${dateStr}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;

      // Pilih produk secara acak (1-3 macam produk, pastikan total < 130000)
      const numItems = Math.floor(Math.random() * 3) + 1;
      let orderTotal = 0;
      let selectedItems = [];

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1; // 1 atau 2 qty
        
        // Cek jika ditambah produk ini tidak lebih dari 130rb
        if (orderTotal + (product.price * qty) <= 130000) {
          // Hindari duplikat produk dalam satu order
          const isDuplicate = selectedItems.find(item => item.productId === product.id);
          if (!isDuplicate) {
            selectedItems.push({
              productId: product.id,
              quantity: qty,
              price: product.price
            });
            orderTotal += (product.price * qty);
          }
        }
      }

      // Jika kosong (karena harga terlalu mahal), paksakan pilih 1 produk paling murah
      if (selectedItems.length === 0) {
        const sortedProducts = [...products].sort((a, b) => a.price - b.price);
        const cheapest = sortedProducts[0];
        selectedItems.push({
          productId: cheapest.id,
          quantity: 1,
          price: cheapest.price
        });
        orderTotal = cheapest.price;
      }

      // Buat Order di Database
      await prisma.order.create({
        data: {
          orderId: orderIdStr,
          idempotencyKey: `seed-fix-${Date.now()}-${counter}`,
          shippingName: user.name,
          shippingPhone: '081234567890',
          shippingAddress: 'Bontosunggu, Bajeng',
          subtotal: orderTotal,
          total: orderTotal,
          userId: user.id,
          status: 'SELESAI',
          paymentStatus: 'settlement',
          paymentType: 'qris',
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: selectedItems
          }
        }
      });

      userIndex++;
      counter++;
      process.stdout.write(`\r   ✏️  Dibuat: ${counter}/50 pesanan`);
    }
  }

  console.log(`\n\n✅ Selesai membuat 50 pesanan!`);
  console.log('📈 Distribusi pesanan per hari:');
  distribution.forEach(d => console.log(`   ${d.date} → ${d.count} pesanan`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
