import { Body, Controller, Get, Headers, Param, Post, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { SkipAuth } from 'src/utils/decorators';
import { GameData } from 'src/game/models/game.models';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { Response } from 'express';
import { addFriend, changeBlockStatus, changePseudo, deleteNotif, messageData, modify2fa, newPp } from 'src/typeorm/user.entity';
import { multerOptions } from './multer.config';

@Controller('db-writer')
export class DbWriterController {
    constructor(private readonly dbWriter: DbWriterService) {}

    @SkipAuth()
    @Post('create-user')
    initNewUser(@Body() newUser: any, @Headers() headers){
        return this.dbWriter.createUser(newUser);
    }

    @Post('add-friend')
    addFriend(@Body() newFriend: addFriend, @Headers() headers){
        return this.dbWriter.addFriend(newFriend);
    }

    @Post('get-pm')
    getPm(@Body() obj: messageData, @Headers() headers){
        let pm = this.dbWriter.getPm(obj);
        return pm
    }

    @SkipAuth()
    @Get('data/:login')
    getDataUser(@Param('login') login: string){
        return this.dbWriter.getDataUser(login);
    }

    @Get('friends/:login')
    getFriends(@Param('login') login: string){
        return this.dbWriter.getFriends(login);
    }

    @Post('change-user-pseudo')
    changeUserPseudo(@Body() obj: changePseudo, @Headers() headers){
        return this.dbWriter.changeUserPseudo(obj);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file)
            throw new Error('No file uploaded.');
        return { name: file.originalname };
    }

    @Get('user-pp/:login')
    async getUserPp(@Res() res: Response, @Param('login') login: string) {
        const ppName = await this.dbWriter.getUserPp(login)
        const pathToPp = `/usr/src/app/upload/${ppName}`;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${ppName}`);
        res.sendFile(pathToPp);
    }

    @Post('change-user-pp')
    changeUserPp(@Body() obj: newPp, @Headers() headers){
        return  this.dbWriter.changeUserPp(obj);
    }
    
    @Post('change-2fa')
    change2fa(@Body() obj: modify2fa, @Headers() headers){
        return  this.dbWriter.change2fa(obj);
    }

    @Post('block-friend')
    blockFriend(@Body() obj: changeBlockStatus, @Headers() headers){
        return  this.dbWriter.blockFriend(obj);
    }

    @Post('match-history')
    matchHistory(@Body() obj: GameData, @Headers() headers){
        return  this.dbWriter.fillMatchHistory(obj);
    }

    @Get('leaderboard')
    getLeaderboard(){
        return this.dbWriter.getLeaderboard();
    }

    @Post('delete-notif')
    deleteNotif(@Body() obj: deleteNotif, @Headers() headers){
        return  this.dbWriter.deleteNotif(obj);
    }
}