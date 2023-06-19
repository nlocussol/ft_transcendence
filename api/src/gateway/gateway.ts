import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { DbWriterService } from "src/db-writer/db-writer.service";
import { Server } from 'socket.io'
import { OnModuleInit } from "@nestjs/common";

@WebSocketGateway()
export class MyGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server
    dbWriter: DbWriterService;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id);
        })    
    }

    @SubscribeMessage('add-pm')
    addPrivateMessage(client: any, data: any) {
        this.dbWriter.addPrivateMessage(data);
        this.server.emit('receive-pm', data)
    }
}