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
  console.log('🔄 Memperbarui nama dan email pengguna secara langsung...');
  
  // Ambil user yang digunakan oleh script sebelumnya (take 50)
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    take: 50
  });

  if (users.length !== 50) {
    console.log(`⚠️ Hanya ditemukan ${users.length} user di DB. Proses dilanjutkan.`);
  }

  let successCount = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const newData = newUsers[i];
    
    try {
      // Update email and name
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: newData.nama,
          email: newData.email
        }
      });
      
      // Update shippingName di table orders
      await prisma.order.updateMany({
        where: { userId: user.id },
        data: {
          shippingName: newData.nama
        }
      });
      
      successCount++;
      process.stdout.write(`\r   ✅ Diperbarui: ${successCount}/${users.length}`);
    } catch (e) {
      console.log(`\n❌ Error pada user ID ${user.id}: ${e.message}`);
    }
  }
  
  console.log(`\n✅ Selesai! Berhasil memperbarui ${successCount} pembeli dan order mereka.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
