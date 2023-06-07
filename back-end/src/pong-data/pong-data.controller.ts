import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { PongDataService } from './pong-data.service';
import { MatchData, PlayerData, NoMatchFound } from './interfaces/pong-data.interface';

@Controller('pong-data')
export class PongDataController {
    constructor(private readonly pongData: PongDataService) {}
    @Get(':UUID')
    getMatchmakingData(@Param('UUID') uuid: string): MatchData | NoMatchFound {
        return this.pongData.matchmakingData(uuid);
    }

    @Post()
    createPlayerData(@Body() newPlayer: PlayerData, @Headers() headers) {
        // console.log(headers)
        // console.log(newPlayer)
        this.pongData.addPlayerData(newPlayer)
    }

    @Patch(':matchUUID')
    updateMatch(@Param('matchUUID') matchUUID: string, @Body() matchtoUpdate: MatchData) {

    }

}
