import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { DbWriterService } from "src/db-writer/db-writer.service";
import { Server, Socket } from 'socket.io'
import { OnModuleInit } from "@nestjs/common";
import { messageData } from "src/typeorm/user.entity";
import { DbWriterRoomService } from "src/db-writer-room/db-writer-room.service";
import { BanUser, NewMessage, UserInRoom } from "src/typeorm/room.entity";

@WebSocketGateway({cors : true})
export class MyGateway implements OnModuleInit{
    @WebSocketServer()
    server: Server;
    clientSocket: Socket;

    constructor(private dbWriter: DbWriterService, private dbWriterRoom: DbWriterRoomService) {}

    onModuleInit() {
        this.server.on('connection', (socket) => this.clientSocket = socket)
    }

    @SubscribeMessage('send-notif')
    async sendFriendRequest(client: Socket, friendToAdd: any) {
        this.dbWriter.addNotif(friendToAdd);
        this.server.emit('receive-notif', friendToAdd)
    }

    @SubscribeMessage('add-pm')
    async addPrivateMessage(client: Socket, messageData: messageData) {        
        const uuid = await this.dbWriter.addPrivateMessage(messageData);
        if (uuid == null)
            return ;
        this.clientSocket.join(uuid);
        this.server.to(uuid).emit('receive-pm', messageData)
    }

    @SubscribeMessage('add-room-msg')
    async addRoomMessage(client: Socket, messageData: NewMessage) {
        const uuid = await this.dbWriterRoom.addMessage(messageData);
        if (uuid == null)
            return ;
        this.clientSocket.join(uuid);
        // this.server.to(uuid).emit('receive-room-msg', messageData)
        this.server.emit('receive-room-msg', messageData)
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
}