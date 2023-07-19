import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { DbWriterService } from "src/db-writer/db-writer.service";
import { Server, Socket } from 'socket.io'
import { OnModuleInit } from "@nestjs/common";
import { addFriend, messageData } from "src/typeorm/user.entity";
import { DbWriterRoomService } from "src/db-writer-room/db-writer-room.service";
import { BanUser, NewMessage, UserInRoom, MuteUser } from "src/typeorm/room.entity";

@WebSocketGateway({cors : true})
export class MyGateway implements OnModuleInit{
    @WebSocketServer()
    server: Server;

    constructor(private dbWriter: DbWriterService, private dbWriterRoom: DbWriterRoomService) {}

    onModuleInit() {
        this.server.on('connection', () => {})
    }

    @SubscribeMessage('send-notif')
    async sendFriendRequest(client: Socket, friendToAdd: any) {
        this.dbWriter.addNotif(friendToAdd);
        this.server.emit('receive-notif', friendToAdd)
    }

    @SubscribeMessage('join-pm')
    async joinPm(client: Socket, friendPm: addFriend) {
        const uuid = await this.dbWriter.getPmUuid(friendPm);
        if (uuid == null)
            return ;
        client.join(uuid)
    }

    @SubscribeMessage('leave-pm')
    async leavePm(client: Socket, friendPm: addFriend) {
        const uuid = await this.dbWriter.getPmUuid(friendPm);
        if (uuid == null)
            return ;
        client.leave(uuid)
    }

    @SubscribeMessage('socket-join-room')
    async socketJoinPm(client: Socket, roomName: string) {
        const uuid = await this.dbWriterRoom.getRoomUuid(roomName);
        if (uuid == null)
            return ;
        client.join(uuid)
    }

    @SubscribeMessage('socket-leave-room')
    async socketLeavePm(client: Socket, roomName: string) {
        const uuid = await this.dbWriterRoom.getRoomUuid(roomName);
        if (uuid == null)
            return ;
        client.leave(uuid)
    }

    @SubscribeMessage('add-pm')
    async addPrivateMessage(client: Socket, messageData: messageData) {  
        const uuid = await this.dbWriter.addPrivateMessage(messageData);
        if (uuid == null)
            return ;
        client.join(uuid);
        this.server.to(uuid).emit('receive-pm', messageData)
    }

    @SubscribeMessage('add-room-msg')
    async addRoomMessage(client: Socket, messageData: NewMessage) {
        const uuid = await this.dbWriterRoom.addMessage(messageData);
        if (uuid == null)
            return ;
        client.join(uuid);
        this.server.to(uuid).emit('receive-room-msg', messageData)
    }

    @SubscribeMessage('create-room')
    async createRoom(client: Socket, messageData: messageData) {
        const res = await this.dbWriterRoom.createRoom(messageData)
        if (res == null)
            return ;
        this.server.emit('all-room', messageData);
    }

    @SubscribeMessage('request-join-room')
    async joinRoom(client: Socket, messageData: UserInRoom) {
        const res = await this.dbWriterRoom.addUserToRoom(messageData);
        if (res == null)
            return ;
        this.server.emit('join-room', messageData);
    }

    @SubscribeMessage('leave-room')
    async quitRoom(client: Socket, messageData: messageData) {
        const res = await this.dbWriterRoom.leaveRoom(messageData);
        if (res == null)
            return ;
        this.server.emit('has-leave-room', messageData);
    }

    @SubscribeMessage('ban-member')
    async banMember(client: Socket, messageData: BanUser) {
        const res = await this.dbWriterRoom.banMember(messageData);
        if (res == null)
            return ;
        this.server.emit('ban-member-room', {name: messageData.name, login: messageData.login});
    }
    
    @SubscribeMessage('mute-member')
    async muteMember(client: Socket, muteUser: MuteUser){
        const res = await this.dbWriterRoom.muteMember(muteUser);
        if (res == null)
            return ;
    }

    @SubscribeMessage('delete-friend')
    async deleteFriend(client: Socket, friendToDelete: any) {
        const res = await this.dbWriter.deleteFriend(friendToDelete);
        if (res == null)
            return ;
        this.server.emit('friend-deleted', friendToDelete);
    }

    @SubscribeMessage('room-change-status')
    async roomChangeStatus(client: Socket, status: any) {
        const res = await this.dbWriterRoom.changeStatus(status);
        if (res == null)
            return ;
        this.server.emit('room-status-changed', status);
    }

    @SubscribeMessage('user-change-status')
    async userChangeStatus(client: Socket, status: any) {
        console.log(status)
        const res = await this.dbWriter.changeStatus(status);
        if (res == null)
            return ;
        this.server.emit('user-status-changed', status);
    }

    @SubscribeMessage('user-room-change-status')
    async userRoomChangeStatus(client: Socket, status: any) {
        const res = await this.dbWriterRoom.changeMemberStatus(status);
        if (res == null)
            return ;
        this.server.emit('user-room-status-changed', status);
    }

    @SubscribeMessage('block-friend')
    async blockFriend(client: Socket, blocked: any) {
        const res = await this.dbWriter.blockFriend(blocked);
        if (res == null)
            return ;
        this.server.emit('friend-blocked', blocked);
    }
}