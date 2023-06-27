import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterRoomService } from './db-writer-room.service';

@Controller('db-writer-room')
export class DbWriterRoomController {
    constructor (private readonly dbWriterRoom: DbWriterRoomService){}
    
    @Post('create-room')
    createRoom(@Body() newRoom: any, @Headers() headers){
        return this.dbWriterRoom.createRoom(newRoom);
    }

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

    @Post('add-user-room')
    addUserToRoom(@Body() newUser: any, @Headers() headers){
        return this.dbWriterRoom.addUserToRoom(newUser);
    }

    @Post('add-message')
    addMessage(@Body() obj: any, @Headers() headers){
        return this.dbWriterRoom.addMessage(obj);
    }

    @Patch('change-room-name')
    changeRoomName(@Body() perm: any, @Headers() headers){
        return this.dbWriterRoom.changeRoomName(perm);
    }

    @Post('change-status')
    changeStatus(@Body() obj: any, @Headers() headers){
        return this.dbWriterRoom.changeStatus(obj);
    }

    @Post('leave-room')
    leaveRoom(@Body() obj: any, @Headers() headers){
        return this.dbWriterRoom.leaveRoom(obj);
    }

    @Post('ban-member')
    banMember(@Body() obj: any, @Headers() headers){
        return this.dbWriterRoom.banMember(obj);
    }

    @Post('mute-member')
    muteMember(@Body() obj: any, @Headers() headers){
        return this.dbWriterRoom.muteMember(obj);
    }
}
