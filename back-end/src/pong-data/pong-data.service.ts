import { Injectable } from '@nestjs/common';
import { MatchData } from './interfaces/pong-data.interface';

@Injectable()
export class PongDataService {
    matchData: MatchData[] = [{
        matchID: -1
    }];

    addMatchData(newMatchData: MatchData) {
        this.matchData = [...this.matchData, newMatchData];
    }
}
