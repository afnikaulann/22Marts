import 'dotenv/config';
// Polyfill WebSocket untuk Node.js < 22 (Penting untuk Supabase)
if (typeof global !== 'undefined' && !(global as any).WebSocket) {
  try {
    (global as any).WebSocket = require('ws');
    console.log('[Polyfill] WebSocket has been loaded globally');
  } catch (e) {
    console.warn('[Polyfill] Failed to load ws package. Please run "pnpm add ws"');
  }
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://22mart.id',
      'http://43.129.50.42:3000'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 4000}`);
}
bootstrap();
