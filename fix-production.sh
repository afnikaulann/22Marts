#!/bin/bash

# --- 22MART PRODUCTION FIXER SCRIPT ---
# Jalankan script ini dengan: bash fix-production.sh

echo "🚀 Memulai perbaikan sistem 22Mart..."

# 1. PERBAIKAN BACKEND
echo "📦 Mengupdate Backend..."
cd ~/22marts/backend

# Ambil perubahan terbaru dari git
git pull origin main

# Instal ulang deps
pnpm install

# Generate Prisma Client (Wajib untuk database)
npx prisma generate
npx prisma db push

# Build ulang
rm -rf dist
pnpm build

# Cari di mana file main.js berada (dist/main.js atau dist/src/main.js)
if [ -f "dist/main.js" ]; then
    ENTRY_POINT="dist/main.js"
elif [ -f "dist/src/main.js" ]; then
    ENTRY_POINT="dist/src/main.js"
else
    echo "❌ Error: main.js tidak ditemukan di folder dist!"
    exit 1
fi

echo "✅ Entry point ditemukan di: $ENTRY_POINT"

# Restart Backend di PM2
pm2 delete backend || true
pm2 start $ENTRY_POINT --name "backend"

# 2. PERBAIKAN FRONTEND
echo "🖥️ Mengupdate Frontend..."
cd ~/22marts/frontend

# Ambil perubahan terbaru
git pull origin main

# Build ulang (Agar API URL tertanam dengan benar)
pnpm install
rm -rf .next
pnpm build

# Restart Frontend di PM2
pm2 delete frontend || true
pm2 start "pnpm start" --name "frontend"

# 3. FINALISASI
pm2 save
echo "✨ Selesai! Website seharusnya sudah bisa membaca database sekarang."
echo "🔗 Cek di: https://22mart.id"
