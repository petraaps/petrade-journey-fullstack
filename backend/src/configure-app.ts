import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ??
      'http://localhost:5173,http://127.0.0.1:5173')
      .split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
}
