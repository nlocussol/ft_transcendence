import { OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io'

@WebSocketGateway({
  cors: true,
  namespace: 'pong'
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  io: Namespace;

  afterInit(server: any) {
  }

  handleConnection(client: Socket) {

    console.log(client.id)
    client.emit("fdp");
    this.io.emit("fdfda")
    
  }

  handleDisconnect(client: Socket) {
    
  }

  updateGame() {

  }
}
