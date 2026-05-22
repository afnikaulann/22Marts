/**
 * UPDATE EMAIL & NO HP AKUN PEMBELI DUMMY
 * =========================================
 * Skrip ini memperbarui email dan nomor HP
 * dari 25 akun pembeli yang sudah dibuat sebelumnya.
 *
 * Cara menjalankan:
 *   node update-akun.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping: [email lama, email baru, hp lama, hp baru]
const UPDATES = [
  ['nurul.hidayah22@gmail.com',   'nurul.hdayh22@gmail.com',         '082292110001', '082292110041'],
  ['ahmad.faisal.gowa@gmail.com', 'ahmadfaisal.id@gmail.com',        '082292110002', '081345678122'],
  ['siti.rahma.bajeng@gmail.com', 'sitirahma.98@gmail.com',          '082292110003', '085299123403'],
  ['m.rizky.limbung@gmail.com',   'm.rizkyputra@gmail.com',          '082292110004', '082188765414'],
  ['fitriani.amir99@gmail.com',   'fitriani.amir99@gmail.com',       '082292110005', '085342119905'],
  ['wahyu.pratama.gowa@gmail.com','wahyuu.pratama@gmail.com',        '082292110006', '081244556616'],
  ['rahmawati.bajeng@gmail.com',  'rahma.wati88@gmail.com',          '082292110007', '082393114407'],
  ['a.karim.gowa@gmail.com',      'abdul.karim01@gmail.com',         '082292110008', '085102345608'],
  ['hasnawati.gowa@gmail.com',    'hasnawati.wt@gmail.com',          '082292110009', '081355667719'],
  ['irfan.hakim.limbung@gmail.com','irfanhakim.official@gmail.com',  '082292110010', '082291445510'],
  ['nuraeni.bajeng@gmail.com',    'nuraeni.ann@gmail.com',           '082292110011', '085211223321'],
  ['reski.amalia22@gmail.com',    'reski.amalia22@gmail.com',        '082292110012', '082190807032'],
  ['burhanuddin.gowa@gmail.com',  'burhanuddin.bhr@gmail.com',       '082292110013', '081233445543'],
  ['marlina.sari.gowa@gmail.com', 'marlina.sari96@gmail.com',        '082292110014', '085355112254'],
  ['syarifuddin.limbung@gmail.com','syarifuddin.syarif@gmail.com',  '082292110015', '082344778865'],
  ['nursyamsi.bajeng@gmail.com',  'nursyamsi.ns@gmail.com',          '082292110016', '081399887756'],
  ['ruslan.gowa22@gmail.com',     'ruslan.lan22@gmail.com',          '082292110017', '082255443377'],
  ['sunarti.bajeng99@gmail.com',  'sunarti.bunga@gmail.com',         '082292110018', '085266778898'],
  ['alamsyah.gowa@gmail.com',     'alamsyah.putra@gmail.com',        '082292110019', '082177665589'],
  ['hartati.limbung@gmail.com',   'hartati.tati@gmail.com',          '082292110020', '081299001120'],
  ['zulkifli.bajeng@gmail.com',   'zulkifli.zul@gmail.com',          '082292110021', '085311335531'],
  ['aminah.saleh.gowa@gmail.com', 'aminah.saleh02@gmail.com',        '082292110022', '082322446642'],
  ['hasrul.gowa22@gmail.com',     'hasrul.rull@gmail.com',           '082292110023', '081388552253'],
  ['yusnidar.limbung@gmail.com',  'yusnidar95@gmail.com',            '082292110024', '082266339964'],
  ['saharuddin.bajeng@gmail.com', 'sahar.uddin94@gmail.com',         '082292110025', '085277441175'],
];

async function main() {
  console.log('🔄 Memulai update email & nomor HP akun pembeli...\n');

  let berhasil = 0;
  let tidakDitemukan = 0;

  for (const [emailLama, emailBaru, hpLama, hpBaru] of UPDATES) {
    // 1. Cari user berdasarkan email lama
    const user = await prisma.user.findUnique({ where: { email: emailLama } });

    if (!user) {
      console.log(`   ⚠️  Tidak ditemukan: ${emailLama}`);
      tidakDitemukan++;
      continue;
    }

    // 2. Update email user
    await prisma.user.update({
      where: { id: user.id },
      data: { email: emailBaru },
    });

    // 3. Update nomor HP di semua pesanan milik user ini
    await prisma.order.updateMany({
      where: {
        userId: user.id,
        shippingPhone: hpLama,
      },
      data: { shippingPhone: hpBaru },
    });

    console.log(`   ✅ ${user.name}`);
    console.log(`      Email : ${emailLama} → ${emailBaru}`);
    console.log(`      HP    : ${hpLama} → ${hpBaru}\n`);
    berhasil++;
  }

  console.log('─'.repeat(50));
  console.log(`✅ Berhasil diupdate : ${berhasil} akun`);
  console.log(`⚠️  Tidak ditemukan  : ${tidakDitemukan} akun`);
  console.log('\n🎉 Update selesai! Cek kembali Dashboard Admin Anda.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Terjadi error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
