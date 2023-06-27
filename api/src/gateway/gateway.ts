import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { DbWriterService } from "src/db-writer/db-writer.service";
import { Server, Socket } from 'socket.io'
import { OnModuleInit } from "@nestjs/common";
import { messageData } from "src/typeorm/user.entity";
import { DbWriterRoomService } from "src/db-writer-room/db-writer-room.service";

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
    async sendFriendRequest(client: Socket, friendToAdd: messageData) {
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
    async addRoomMessage(client: Socket, messageData: messageData) {
        const uuid = await this.dbWriterRoom.addMessage(messageData);
        if (uuid == null)
            return ;
        this.clientSocket.join(uuid);
        // this.server.to(uuid).emit('receive-room-msg', messageData)
        this.server.emit('receive-room-msg', messageData)
    }

    @SubscribeMessage('create-room')
    createRoom(client: Socket, messageData: messageData) {
        this.dbWriterRoom.createRoom(messageData);
        this.server.emit('all-room', messageData);
    }

    @SubscribeMessage('join-room')
    joinRoom(client: Socket, messageData: messageData) {
        this.dbWriterRoom.addUserToRoom(messageData);
        this.server.emit('join-room', messageData);
    }

    @SubscribeMessage('leave-room')
    quitRoom(client: Socket, messageData: messageData) {
        this.dbWriterRoom.leaveRoom(messageData);
        this.server.emit('leave-room', messageData);
    }
}