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

    @Get('data/:login')
    getDataUser(@Param('login') login: string){
        return this.dbWriter.getDataUser(login);
    }

    @Get('friends/:login')
    getFriends(@Param('login') login: string){
        return this.dbWriter.getFriends(login);
    }

    @Post('change-user-login')
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