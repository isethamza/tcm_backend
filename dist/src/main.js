"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
const bodyParser = require("body-parser");
const swagger_1 = require("@nestjs/swagger");
const dotenv = require("dotenv");
const queue_dashboard_1 = require("./infra/queue/queue.dashboard");
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    process.on('unhandledRejection', (err) => {
        console.error('UNHANDLED REJECTION:', err instanceof Error ? err.stack : err);
    });
    process.on('uncaughtException', (err) => {
        console.error('UNCAUGHT EXCEPTION:', err instanceof Error ? err.stack : err);
    });
    (0, queue_dashboard_1.setupBullBoard)(app);
    app.use(cookieParser());
    app.use(process.env.STRIPE_WEBHOOK_PATH || '/api/payments/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
    app.use(bodyParser.json({ limit: process.env.JSON_LIMIT || '5mb' }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const corsEnv = process.env.CORS_ORIGINS;
    let corsOrigins = true;
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
    app.setGlobalPrefix(process.env.GLOBAL_PREFIX || '');
    app.enableVersioning();
    app.use(process.env.STRIPE_WEBHOOK_ALT_PATH || '/payments/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads',
    });
    if (process.env.ENABLE_SWAGGER === 'true') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle(process.env.SWAGGER_TITLE || 'TCM3 Logistics API')
            .setDescription(process.env.SWAGGER_DESCRIPTION || 'Transport & Courier Management API')
            .setVersion(process.env.SWAGGER_VERSION || '1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
            .addCookieAuth('accessToken')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup(process.env.SWAGGER_PATH || 'docs', app, document);
    }
    const PORT = Number(process.env.PORT) || 3000;
    await app.listen(PORT);
    console.log(`🚀 API running at http://localhost:${PORT}/`);
    if (process.env.ENABLE_SWAGGER === 'true') {
        console.log(`📚 Swagger at http://localhost:${PORT}/${process.env.SWAGGER_PATH || 'docs'}`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map
