import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterRoomService } from './db-writer-room.service';
import {Passwords, UserStatus } from 'src/typeorm/room.entity';

@Controller('db-writer-room')
export class DbWriterRoomController {
    constructor (private readonly dbWriterRoom: DbWriterRoomService){}
    @Get('all-room/')
    getAllRoom(){
        return this.dbWriterRoom.getAllRoom();
    }

    @Get('all-room/:userName')
    getAllRoomOfUser(@Param('userName') userName: string){
        return this.dbWriterRoom.getAllRoomOfUser(userName);
    }

    @Get('data-room/:roomName')
    dataRoom(@Param('roomName') roomName: string){
        return this.dbWriterRoom.dataRoom(roomName);
    }

    @Get('search-room/:roomName')
    searchRoom(@Param('roomName') roomName: string){
        return this.dbWriterRoom.searchRoom(roomName);
    }

    @Post('change-member-status')
    changeMemberStatus(@Body() obj: UserStatus, @Headers() headers){
        return this.dbWriterRoom.changeMemberStatus(obj);
    }

    @Post('check-password')
    CheckPassword(@Body() obj: Passwords, @Headers() headers){
        return this.dbWriterRoom.checkPassword(obj);
    }
}
