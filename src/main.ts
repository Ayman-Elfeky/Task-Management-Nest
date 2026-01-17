import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthLoggingInterceptor } from './auth/auth-logging.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  const origins = configService.get<string>('CORS_ORIGINS') || ["http://localhost:3000"];
  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // global logging interceptor
  // app.useGlobalInterceptors(new AuthLoggingInterceptor());
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
}
bootstrap();