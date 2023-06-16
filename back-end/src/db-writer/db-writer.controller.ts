import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterService } from 'src/db-writer/db-writer.service';

@Controller('db-writer')
export class DbWriterController {
    constructor(private readonly dbWriter: DbWriterService) {}
    //get the object of a new user configuration
    @Post('create-user')
    initNewUser(@Body() newUser: any, @Headers() headers){
        console.log(newUser);
        return this.dbWriter.createUser(newUser);
    }

    @Post('add-friend')
    addFriend(@Body() newFriend: any, @Headers() headers){
        console.log(newFriend);
        return this.dbWriter.addFriend(newFriend);
    }

    @Post('get-pm')
    getPm(@Body() obj: any, @Headers() headers){
        return this.dbWriter.getPm(obj);
    }

    @Post('add-pm')
    addPm(@Body() obj: any, @Headers() headers){
        return this.dbWriter.addPrivateMessage(obj);
    }

    @Get(':pseudo')
    getDataUser(@Param('pseudo') pseudo: string){
        return this.dbWriter.getDataUser(pseudo);
    }
}