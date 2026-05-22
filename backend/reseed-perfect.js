const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newUsers = [
  { nama: "Muhammad Fadly Mahmud", email: "fadlymahmud99@gmail.com" },
  { nama: "Resky Amalia Putri", email: "resky_amaliaputri@gmail.com" },
  { nama: "Anwar Sidiq Pratama", email: "anwarsidiq.p@gmail.com" },
  { nama: "Irma Suryani", email: "irmasuryani99@gmail.com" },
  { nama: "Syamsul Daeng Ngade", email: "syamsuldgngade@gmail.com" },
  { nama: "Nursanti Daeng Nurang", email: "nursantinurang@gmail.com" },
  { nama: "Muhammad Arif", email: "arifmuhammad1204@gmail.com" },
  { nama: "Indah Sari Ramli", email: "indahsari_ramli@gmail.com" },
  { nama: "Faisal Basri", email: "faisalbasri95@gmail.com" },
  { nama: "Hasnawati Siregar", email: "hasnawati.siregar@gmail.com" },
  { nama: "Ridwan Marhaban", email: "ridwanmarhaban@gmail.com" },
  { nama: "Anti Kartika", email: "antikartika02@gmail.com" },
  { nama: "Akbar Pratama", email: "akbarpratama_putra@gmail.com" },
  { nama: "Mega Utami Lestari", email: "megautami.lestari@gmail.com" },
  { nama: "Hendra Wijaya Putra", email: "hendrawp@gmail.com" },
  { nama: "Suci Ramadhani", email: "suciiramadhani98@gmail.com" },
  { nama: "Yusuf Daeng Sila", email: "yusufdgsila@gmail.com" },
  { nama: "Dian Purnamasari", email: "dianpurnamasari97@gmail.com" },
  { nama: "Ilham Hidayat", email: "ilhamhidayat_22@gmail.com" },
  { nama: "Fitriani Bakri", email: "fitriani.bakri@gmail.com" },
  { nama: "Andi Wahyu Pratama", email: "andiwahyupratama@gmail.com" },
  { nama: "Asriani Asis", email: "asriani_asis@gmail.com" },
  { nama: "Bahrul Ulum", email: "bahrululum15@gmail.com" },
  { nama: "Murni Sari", email: "murnisariputri@gmail.com" },
  { nama: "Zulkifli Ahmad", email: "zulkifli.ahmad99@gmail.com" },
  { nama: "Muhammad Fadly Mahmud", email: "fadlymahmud.official@gmail.com" },
  { nama: "Resky Amalia Putri", email: "kikiamaliaputri@gmail.com" },
  { nama: "Anwar Sidiq Pratama", email: "anwar_sidiq24@gmail.com" },
  { nama: "Irma Suryani", email: "suryaniirma99@gmail.com" },
  { nama: "Syamsul Daeng Ngade", email: "syamsul_ngade@gmail.com" },
  { nama: "Nursanti Daeng Nurang", email: "antinurang22@gmail.com" },
  { nama: "Muhammad Arif", email: "arifmuhammad00@gmail.com" },
  { nama: "Indah Sari Ramli", email: "indahsari_r@gmail.com" },
  { nama: "Faisal Basri", email: "faisal.basri95@gmail.com" },
  { nama: "Hasnawati Siregar", email: "hasnawatisrg@gmail.com" },
  { nama: "Ridwan Marhaban", email: "marhabanridwan@gmail.com" },
  { nama: "Anti Kartika", email: "anti_kartika22@gmail.com" },
  { nama: "Akbar Pratama", email: "akbarpratama98@gmail.com" },
  { nama: "Mega Utami Lestari", email: "megautamil@gmail.com" },
  { nama: "Hendra Wijaya Putra", email: "hendrawijayaputra@gmail.com" },
  { nama: "Suci Ramadhani", email: "suciramadhani_putri@gmail.com" },
  { nama: "Yusuf Daeng Sila", email: "yusufsila88@gmail.com" },
  { nama: "Dian Purnamasari", email: "dian_purnamasari@gmail.com" },
  { nama: "Ilham Hidayat", email: "ilhamhidayat2002@gmail.com" },
  { nama: "Fitriani Bakri", email: "fitribakri99@gmail.com" },
  { nama: "Andi Wahyu Pratama", email: "wahyupratama.putra@gmail.com" },
  { nama: "Asriani Asis", email: "asrianiasis96@gmail.com" },
  { nama: "Bahrul Ulum", email: "bahrul.ulum2015@gmail.com" },
  { nama: "Murni Sari", email: "murnisari_putri@gmail.com" },
  { nama: "Zulkifli Ahmad", email: "zulkifliahmadwork@gmail.com" }
];

async function main() {
  console.log('🔄 Membersihkan data pesanan dan pengguna lama...');
  
  // Hapus semua orderItem, order, cartItem
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  
  // Hapus semua user dengan role USER
  await prisma.user.deleteMany({ where: { role: 'USER' } });

  console.log('✅ Data lama dihapus. Membuat 50 pengguna dan pesanan baru...');

  // 1. Buat 50 Users
  const createdUsers = [];
  for (const u of newUsers) {
    const user = await prisma.user.create({
      data: {
        name: u.nama,
        email: u.email,
        password: "password123",
        role: "USER"
      }
    });
    createdUsers.push(user);
  }

  // 2. Ambil Produk (harga di bawah 100rb)
  const products = await prisma.product.findMany({
    where: { price: { lt: 100000 } }
  });

  if (products.length === 0) {
    console.log('❌ Tidak ada produk dengan harga di bawah 100rb!');
    return;
  }

  // 3. Distribusi Pesanan (14 Mei - 20 Mei)
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
      const user = createdUsers[userIndex];
      
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
        
        if (orderTotal + (product.price * qty) <= 130000) {
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
          idempotencyKey: `seed-perfect-${Date.now()}-${counter}`,
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

  console.log(`\n\n✅ Selesai! Semua data sudah direset dengan nama, email, dan tren yang sempurna.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
