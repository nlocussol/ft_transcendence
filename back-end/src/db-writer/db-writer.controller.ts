import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterService } from 'src/db-writer/db-writer.service';

@Controller('db-writer')
export class DbWriterController {
    constructor(private readonly dbWriter: DbWriterService) {}
    //get the object of a new user configuration
    @Post()
    initNewUser(@Body() newUser: any, @Headers() headers){
        return this.dbWriter.createUser(newUser);
    }
}