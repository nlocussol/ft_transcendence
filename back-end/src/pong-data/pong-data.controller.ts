import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { PongDataService } from './pong-data.service';
import { MatchData } from './interfaces/pong-data.interface';

@Controller('pong-data')
export class PongDataController {
    constructor(private readonly pongData: PongDataService) {}
    // @Get()
    // getMatchData(): Promise<any[]> {
    //     return ;
    // }

    @Post()
    createMatchData(@Body() newMatch: MatchData, @Headers() headers) {
        console.log(headers)
        console.log(newMatch)
        this.pongData.addMatchData(newMatch)
    }

}
