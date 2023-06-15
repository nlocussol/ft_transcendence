import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongDataModule } from './pong-data/pong-data.module';
import { DbWriterModule } from './db-writer/db-writer.module';

@Module({
  imports: [PongDataModule, DbWriterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
