import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongDataModule } from './pong-data/pong-data.module';
import { DbWriterModule } from './db-writer/db-writer.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game/game.service';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';
import { GatewayModule } from './gateway/gateway.module';
import entities from './typeorm';

@Module({
  imports: [
    PongDataModule,
    DbWriterModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PWD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    GameModule,
    GatewayModule,
  ],
  controllers: [AppController, GameController],
  providers: [AppService, GameService],
})
export class AppModule {}
