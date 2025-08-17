import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: { origin: true, credentials: true }});
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Статическая раздача файлов
  app.useStaticAssets(join(__dirname, 'uploads'), {
    prefix: '/files',
  });
  
  await app.listen(process.env.PORT || 4000);
  console.log('API on http://localhost:4000');
}
bootstrap();
