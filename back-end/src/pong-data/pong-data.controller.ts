import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { PongDataService } from './pong-data.service';
import { MatchData, PlayerData } from './interfaces/pong-data.interface';

@Controller('pong-data')
export class PongDataController {
    constructor(private readonly pongData: PongDataService) {}
    //find opponent
    @Get(':UUID')
    getMatchmakingData(@Param('UUID') uuid: string): MatchData {
        return this.pongData.matchmakingData(uuid);
    }

    //add new player
    @Post()
    createPlayerData(@Body() newPlayer: PlayerData, @Headers() headers) {
        this.pongData.addPlayerData(newPlayer)
    }

    //get match data with uuid
    @Get('match/:matchUUID')
    getMatchData(@Param('matchUUID') matchUUID: string) : MatchData {
        return this.pongData.matchToGet(matchUUID);
    }

    //update match data with uuid
    @Patch('match/:matchUUID')
    updateMatch(@Param('matchUUID') matchUUID: string, @Body() matchtoUpdate: MatchData) {
        this.pongData.matchToUpdate(matchUUID, matchtoUpdate);
    }
}