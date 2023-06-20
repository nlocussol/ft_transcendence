import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongController } from './pong.controller';
import { PongGateway } from './pong.gateway';

@Module({
    providers:[PongService, PongGateway, PongController],
    controllers:[PongController],
    exports:[PongService, PongGateway]
})
export class PongModule {}
