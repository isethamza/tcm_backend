import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { setupBullBoard } from './infra/queue/queue.dashboard';


// Load .env file for current environment
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ============================
  // GLOBAL ERROR HANDLING
  // ============================
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err instanceof Error ? err.stack : err);
  });

  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err instanceof Error ? err.stack : err);
  });
  // ============================
  // Bull Board
  // ============================
  setupBullBoard(app);

  // ============================
  // COOKIE PARSER
  // ============================
  app.use(cookieParser());

  // ============================
  // STRIPE WEBHOOK (RAW BODY)
  // MUST BE BEFORE JSON PARSER
  // ============================
  app.use(
    process.env.STRIPE_WEBHOOK_PATH || '/api/payments/stripe/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ============================
  // JSON PARSER
  // ============================
  app.use(bodyParser.json({ limit: process.env.JSON_LIMIT || '5mb' }));

  // ============================
  // GLOBAL VALIDATION
  // ============================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ============================
  // CORS
  // ============================
  const corsEnv = process.env.CORS_ORIGINS;
  let corsOrigins: string[] | boolean = true; // default allow all
  if (corsEnv) {
    corsOrigins = corsEnv
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // ============================
  // GLOBAL PREFIX & VERSIONING
  // ============================
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || '');
  app.enableVersioning();

  // ============================
  // STRIPE WEBHOOK SECOND ROUTE (if needed)
  // ============================
  app.use(
    process.env.STRIPE_WEBHOOK_ALT_PATH || '/payments/stripe/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ============================
  // STATIC UPLOADS
  // ============================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // ============================
  // SWAGGER CONFIG
  // ============================
  if (process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(process.env.SWAGGER_TITLE || 'TCM3 Logistics API')
      .setDescription(process.env.SWAGGER_DESCRIPTION || 'Transport & Courier Management API')
      .setVersion(process.env.SWAGGER_VERSION || '1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
      .addCookieAuth('accessToken')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(process.env.SWAGGER_PATH || 'docs', app, document);
  }

  // ============================
  // START SERVER
  // ============================
  const PORT = Number(process.env.PORT) || 3000;
  await app.listen(PORT);

  console.log(`🚀 API running at http://localhost:${PORT}/`);
  if (process.env.ENABLE_SWAGGER === 'true') {
    console.log(`📚 Swagger at http://localhost:${PORT}/${process.env.SWAGGER_PATH || 'docs'}`);
  }
}

bootstrap();
