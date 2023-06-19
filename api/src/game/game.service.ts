import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    poolQueue: string[] = [];

    addToQueue(playerUUID: string) {
        const index = this.poolQueue.indexOf(playerUUID, 0);
        if (index == -1) {
            this.poolQueue.push(playerUUID);
        }
    }

    removeFromQueue(playerUUID: string) {
        const index = this.poolQueue.indexOf(playerUUID, 0);
        if (index > -1) {
            this.poolQueue.splice(index, 1);
        }
    }
}
