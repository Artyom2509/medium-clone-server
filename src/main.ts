require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = 8000;

async function bootstrap(port) {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`App running on ${port} port.`);
}

bootstrap(PORT);
