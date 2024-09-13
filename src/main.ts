import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import { winstonLogger } from './utils/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = winstonLogger;
  app.useLogger(logger);

  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS project')
    .setDescription('NestJS project API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, customOptions);

  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );
  const dbPort = configService.get<number>('POSTGRES_PORT') || 5432;

  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(`STAGE: ${configService.get('STAGE')}`);
  Logger.log(`listening on port ${port}`);
  Logger.log(`Database is connecting on port: ${dbPort}`);
}
bootstrap();
