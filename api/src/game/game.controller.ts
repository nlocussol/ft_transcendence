import { Controller, Post, Delete, Param, Get, UseGuards} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {
    }

    @Post(':login')
    addPlayerToQueue(@Param() params: any) {
        this.gameService.addPlayerToQueue(params.login);
    }

    @Delete(':login')
    removePlayerFromQueue(@Param() params: any) {
        this.gameService.removePlayerFromQueue(params.login);
    }

    @Get(':login')
    refreshQueue(@Param() params: any) {
        return this.gameService.refreshQueue(params.login);
    }
}
