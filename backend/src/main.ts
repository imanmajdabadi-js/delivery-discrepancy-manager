import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getApplicationConfig } from './config/application.config';

async function bootstrap() {
  const config = getApplicationConfig(process.env);
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.frontendOrigin });

  await app.listen(config.port);
}

void bootstrap();
