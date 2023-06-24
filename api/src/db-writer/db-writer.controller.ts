import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterService } from 'src/db-writer/db-writer.service';

@Controller('db-writer')
export class DbWriterController {
    constructor(private readonly dbWriter: DbWriterService) {}
    @Post('create-user')
    initNewUser(@Body() newUser: any, @Headers() headers){
        return this.dbWriter.createUser(newUser);
    }

    @Post('add-friend')
    addFriend(@Body() newFriend: any, @Headers() headers){
        return this.dbWriter.addFriend(newFriend);
    }

    @Post('get-pm')
    getPm(@Body() obj: any, @Headers() headers){
        let pm = this.dbWriter.getPm(obj);
        return pm
    }

    @Get('data/:pseudo')
    getDataUser(@Param('pseudo') pseudo: string){
        return this.dbWriter.getDataUser(pseudo);
    }

    @Get('friends/:pseudo')
    getFriends(@Param('pseudo') pseudo: string){
        return this.dbWriter.getFriends(pseudo);
    }

    @Post('change-user-pseudo')
    changeUserPseudo(@Body() obj: any, @Headers() headers){
        return this.dbWriter.changeUserPseudo(obj);
    }

    @Post('change-user-pp')
    changeUserPp(@Body() obj: any, @Headers() headers){
        return  this.dbWriter.changeUserPp(obj);
    }

    @Post('change-2fa')
    change2fa(@Body() obj: any, @Headers() headers){
        return  this.dbWriter.change2fa(obj);
    }

    @Post('block-friend')
    blockFriend(@Body() obj: any, @Headers() headers){
        return  this.dbWriter.blockFriend(obj);
    }

    @Post('match-history')
    matchHistory(@Body() obj: any, @Headers() headers){
        return  this.dbWriter.fillMatchHistory(obj);
    }

    @Get('leaderboard')
    getLeaderboard(){
        return this.dbWriter.getLeaderboard();
    }
}