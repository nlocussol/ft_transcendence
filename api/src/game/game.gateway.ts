import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io'
import { GameService } from './game.service';
import { GameData } from './models/game.models';

@WebSocketGateway({
  cors: true,
  namespace: 'game/inprogress'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Namespace;
  socket: Socket;

  constructor(private gameService: GameService) {}

  afterInit(server: any) {
  }

  handleConnection(socket: Socket) {
    console.log(socket.id);
  }

  handleDisconnect(client: Socket) {
    
  }

  updateGame() {

  }

  @SubscribeMessage('updatePlayers')
  handleMessage(client: any, payload: GameData){
    client
    console.log(payload);
  }
}
