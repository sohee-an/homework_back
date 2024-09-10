import { MiddlewareConsumer, Module, NestMiddleware, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { AssignmentModule } from './assignment/assignment.module';
import postgresConfig from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_NAME, PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { CommonModule } from './common/common.module';
import { LogMiddleware } from 'src/common/middleware/log.middleware';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { AssignmentGroupModule } from './assignment-group/assignment-group.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let obj: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          database: configService.get('postgres.database'),
          username: configService.get('postgres.username'),
          password: configService.get('postgres.password'),
          autoLoadEntities: true,
        };
        // 주의! development 환경에서만 개발 편의성을 위해 활용
        if (configService.get('NODE_ENV') === 'development') {
          console.info('Sync TypeORM');
          obj = Object.assign(obj, {
            synchronize: true,
            logging: true,
          });
        }
        return obj;
      },
    }),
    VideoModule,
    AnalyticsModule,
    UserModule,
    AuthModule,
    CommonModule,
    AssignmentModule,
    AwsModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_NAME,
      serveRoot: '/public',
    }),
    AssignmentGroupModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Logger,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('*');
  }
}
