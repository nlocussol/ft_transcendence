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

    @SubscribeMessage('add-pm')
    async addPrivateMessage(client: any, messageData: messageData) {        
        const uuid = await this.dbWriter.addPrivateMessage(messageData);
        if (uuid == null)
            return ;
        this.clientSocket.join(uuid);
        this.server.to(uuid).emit('receive-pm', messageData)
    }

    @SubscribeMessage('add-pm-room')
    addRoomMessage(client: Socket, messageData: messageData) {
        this.dbWriter.addPrivateMessage(messageData);
        this.server.emit('receive-pm-room', messageData)
    }
}