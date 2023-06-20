import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
    constructor(private pongService: PongService) {

    }
    
    @Post()
    addPlayerToQueue(@Body() {UUID}) {
        // console.log(body.UUID)
        console.log(UUID);
        this.pongService.addToQueue(UUID);
    }

    // Should probably pass play-to-remove in route car je suis un bozo
    @Delete()
    removePlayerFromQueue(@Req() req: Request) {
        // console.log("To remove => " + req.headers['player-to-remove'])
        this.pongService.removeFromQueue(req.headers['player-to-remove'])
    }

    @Get()
    matchmaking(@Req() req: Request){
        console.log(this.pongService.checkQueue(req.headers['playeruuid']))
        return this.pongService.checkQueue(req.headers['playeruuid']);
    }
}
