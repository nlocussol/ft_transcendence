import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { DbWriterService } from "src/db-writer/db-writer.service";
import { Server } from 'socket.io'
import { OnModuleInit } from "@nestjs/common";
import { messageData } from "src/typeorm/user.entity";

@WebSocketGateway({cors : true})
export class MyGateway implements OnModuleInit{
    @WebSocketServer()
    server: Server

    constructor(private dbWriter: DbWriterService) {}

    onModuleInit() {
        this.server.on('connection', (socket) => {
        })
    }

    @SubscribeMessage('add-pm')
    addPrivateMessage(client: any, messageData: messageData) {
        this.dbWriter.addPrivateMessage(messageData);
        this.server.emit('receive-pm', messageData)
    }
}