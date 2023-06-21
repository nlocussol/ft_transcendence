import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterService } from 'src/db-writer/db-writer.service';

@Controller('db-writer')
export class DbWriterController {
    constructor(private readonly dbWriter: DbWriterService) {}
    //get the object of a new user configuration
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

    @Get(':pseudo')
    getDataUser(@Param('pseudo') pseudo: string){
        return this.dbWriter.getDataUser(pseudo);
    }

    @Post('change-user-pseudo')
    changeUserPseudo(@Body() obj: any, @Headers() headers){
        let pm = this.dbWriter.changeUserPseudo(obj);
        return pm
    }
}