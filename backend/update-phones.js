const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newPhones = [
  "081258633971",
  "0895800773433",
  "087847137368",
  "085240294292",
  "082346138622",
  "08982227111",
  "082386760213",
  "082245534512",
  "088804567537",
  "087814970862",
  "085161610711",
  "081341389718",
  "085256400232",
  "089635757921",
  "081245820212",
  "085397673726",
  "085242313811",
  "082195855759",
  "088804034914",
  "082347838285",
  "082393110040",
  "0882021081649",
  "081340411614",
  "085256578700",
  "082252022886",
  "082259171384",
  "081244241359",
  "082199114799",
  "081248250909",
  "087847323458",
  "085345401384",
  "085255116836",
  "082346134096",
  "081247922220",
  "085240748527",
  "082189898284",
  "082324333134",
  "082352327271",
  "081245522004",
  "081340017177",
  "085385881633",
  "089684460986",
  "085955325622",
  "081240957477",
  "088704336811",
  "085270344487",
  "081245411700",
  "085298573490",
  // Karena hanya ada 48 nomor yang diberikan, untuk pembeli ke-49 dan ke-50 akan meminjam nomor urutan pertama dan kedua
  "081258633971", 
  "0895800773433"
];

async function main() {
  console.log('🔄 Memperbarui no HP untuk ke-50 pesanan...');
  
  // Ambil semua order, urutkan berdasarkan email penggunanya atau waktu dibuat agar konsisten dengan 50 pengguna
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
    include: { user: true }
  });

  let count = 0;
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const phone = newPhones[i % newPhones.length];
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingPhone: phone
      }
    });
    count++;
    process.stdout.write(`\r   ✅ No HP diperbarui: ${count}/${orders.length}`);
  }

  console.log(`\n✅ Selesai memperbarui no HP!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
