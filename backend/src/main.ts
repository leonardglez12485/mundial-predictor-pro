import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

function buildCorsOptions(configService: ConfigService): CorsOptions {
  const configuredOrigins = configService.get<string>("CORS_ORIGINS");
  const allowedOrigins = new Set(
    (configuredOrigins ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || localhostPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} no permitido por CORS`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3001);

  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors(buildCorsOptions(configService));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.getHttpAdapter().getInstance().disable("x-powered-by");

  if (configService.get<string>("SWAGGER_ENABLED", "true") === "true") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Mundial Predictor Pro API")
      .setDescription("API de predicciones del Mundial con NestJS y Prisma")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      jsonDocumentUrl: "api/docs-json",
    });
  }

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://TU-APP.vercel.app',  // ← reemplazá con tu URL real de Vercel
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001); 
}

void bootstrap();