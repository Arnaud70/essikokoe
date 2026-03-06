import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   // Configuration CORS avec port 5173
  app.enableCors({
    origin: [
      'http://localhost:3000',   // React/Vue/Angular en dev
      'http://127.0.0.1:3000',   // Variante locale
      'http://10.0.2.2:3000',    // Android Emulator
      'http://localhost',        // Flutter web
      'http://127.0.0.1',        // Variante Flutter web
      'http://localhost:5173',   //  Vite (React/Vue/Svelte)
      'https://esikokoe-zurx.vercel.app', // Frontend production Vercel
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Esikokoe API')
    .setDescription('API for Intercontinental Eau - Esikokoe')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // expose Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 9000;
  await app.listen(port);
  // Startup messages shown when the server is ready
  console.log(`Backend esikokoe démarré sur http://localhost:${port}`);
  console.log(`Swagger disponible sur http://localhost:${port}/api/docs`);
}

bootstrap();
