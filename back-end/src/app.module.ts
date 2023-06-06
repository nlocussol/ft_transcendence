import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongDataModule } from './pong-data/pong-data.module';

@Module({
  imports: [PongDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
