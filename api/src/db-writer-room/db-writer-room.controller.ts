import { Body, Controller, Get, Headers, Param, Post, Patch } from '@nestjs/common';
import { DbWriterRoomService } from './db-writer-room.service';
import { BanUser, ChangeStatus, MuteUser, NewMessage, Passwords, UserInRoom, UserStatus } from 'src/typeorm/room.entity';

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
    addUserToRoom(@Body() newUser: UserInRoom, @Headers() headers){
        return this.dbWriterRoom.addUserToRoom(newUser);
    }

    @Post('add-message')
    addMessage(@Body() obj: NewMessage, @Headers() headers){
        return this.dbWriterRoom.addMessage(obj);
    }

    @Post('change-status')
    changeStatus(@Body() obj: ChangeStatus, @Headers() headers){
        return this.dbWriterRoom.changeStatus(obj);
    }

    @Post('change-member-status')
    changeMemberStatus(@Body() obj: UserStatus, @Headers() headers){
        return this.dbWriterRoom.changeMemberStatus(obj);
    }

    @Post('leave-room')
    leaveRoom(@Body() obj: UserInRoom, @Headers() headers){
        return this.dbWriterRoom.leaveRoom(obj);
    }

    @Post('ban-member')
    banMember(@Body() obj: BanUser, @Headers() headers){
        return this.dbWriterRoom.banMember(obj);
    }

    @Post('mute-member')
    muteMember(@Body() obj: MuteUser, @Headers() headers){
        return this.dbWriterRoom.muteMember(obj);
    }

    @Post('check-password')
    CheckPassword(@Body() obj: Passwords, @Headers() headers){
        return this.dbWriterRoom.checkPassword(obj);
    }
}
