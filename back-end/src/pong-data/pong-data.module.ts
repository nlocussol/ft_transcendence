import { Module } from '@nestjs/common';
import { PongDataController } from './pong-data.controller';
import { PongDataService } from './pong-data.service';

@Module({
  controllers: [PongDataController],
  providers: [PongDataService]
})
export class PongDataModule {}
