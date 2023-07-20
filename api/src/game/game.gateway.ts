import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameService } from './game.service';
import { GameData } from './models/game.models';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { environment } from './environment';

class Client {
  id: string;
  login: string;
  pseudo: string;
  room: string;
  socket: Socket;
}

@WebSocketGateway({
  cors: true,
  namespace: 'game',
})
export class GameGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  io: Namespace;
  intervalId: any;
  clientQueue: Client[] = [];
  clientCustomQueue: Client[] = [];
  clients: Client[] = [];

  constructor(private gameService: GameService) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      this.gameService.gameInProgress.forEach((game) => {
        delete game.intervalID;
        this.io.to(game.matchUUID).emit('updatePlayers', game);
      });
    }, environment.TICKRATE);
  }

  onModuleDestroy() {
    clearInterval(this.intervalId);
  }

  afterInit(server: any) {
    this.io.on('connection', (socket) => {
      if (socket.handshake.auth.login == undefined) {
        socket.disconnect();
      }

      this.handleSocketConnection(socket);

      socket.on('disconnect', () => {
        const client = this.clients.find((client) => client.login == socket.handshake.auth.login);

        if (client != undefined) {
          // console.log('DisconnectGateway: ', client.pseudo);
          this.removePlayerFromQueue(client);
          this.gameService.handleDeconnexion(
            client.login,
          );
        }
      });
    });
  }

  handleSocketConnection(socket: Socket) {
    if (
      this.clients.find(
        (client) => client.login == socket.handshake.auth.login,
      ) == undefined
    ) {
      let client = new Client();
      client.login = socket.handshake.auth.login;
      client.pseudo = socket.handshake.auth.pseudo;
      client.id = socket.id;
      client.socket = socket;
      this.clients.push(client);
    } else {
      let client = this.clients.find(
        (client) => client.login == socket.handshake.auth.login,
      );
      client.id = socket.id;
      client.socket = socket;
      client.pseudo = socket.handshake.auth.pseudo;
    }
  }

  removePlayerFromQueue(client: Client) {
    let clientIndex = this.clientQueue.indexOf(client, 0);
    if (clientIndex >= 0) {
      this.clientQueue.splice(clientIndex, 1);
      return;
    }
    clientIndex = this.clientCustomQueue.indexOf(client, 0);
    if (clientIndex >= 0) {
      this.clientCustomQueue.splice(clientIndex, 1);
      return;
    }
  }

  handleReconnection(client: Client) {
    if (client.room == undefined) {
      return;
    }
    client.socket.join(client.room);
    this.gameService.handleReconnexion(client.login, client.room);
  }

  @SubscribeMessage('queue')
  handleQueue(socket: Socket, queueType: any) {
    let client = this.clients.find((c) => c.socket.id == socket.id);
    if (client == undefined) {
      console.log('GameGatewayHandleQueue: Can not found client by id');
      return;
    }

    // Return if client is already in queue
    if (
      this.clientCustomQueue.find((c) => c.socket.id == socket.id) != undefined
    ) {
      return;
    } else if (
      this.clientQueue.find((c) => c.socket.id == socket.id) != undefined
    ) {
      return;
    }

    this.addPlayerToQueue(client, queueType);
    if (this.clientQueue.length >= 2) {
      this.addPlayersToRoom(queueType);
    }
    if (this.clientCustomQueue.length >= 2) {
      this.addPlayersToRoom(queueType);
    }
  }

  addPlayerToQueue(client: Client, queueType: string) {
    // If the player is already in a game make force it to join said game
    const gameUUID = this.gameService.findGameUUIDWithLogin(client.login);
    if (gameUUID != undefined) {
      client.socket.join(gameUUID);
      this.gameService.handleReconnexion(client.login, gameUUID);
      return;
    }
    if (queueType === 'classic') {
      this.clientQueue.push(client);
    } else if (queueType === 'custom') {
      this.clientCustomQueue.push(client);
    }
  }

  addPlayersToRoom(queueType: string) {
    if (queueType === 'classic') {
      // false means classic game mod, true means custom
      const game: GameData = this.gameService.createNewGame(false);

      let client: Client = this.clientQueue.shift();
      client.room = game.matchUUID;
      game.players[0].login = client.login;
      game.players[0].pseudo = client.pseudo;
      client.socket.join(game.matchUUID);

      client = this.clientQueue.shift();
      client.room = game.matchUUID;
      game.players[1].login = client.login;
      game.players[1].pseudo = client.pseudo;
      client.socket.join(game.matchUUID);
    } else if (queueType === 'custom') {
      const game: GameData = this.gameService.createNewGame(true);

      let client: Client = this.clientCustomQueue.shift();
      client.room = game.matchUUID;
      game.players[0].login = client.login;
      game.players[0].pseudo = client.pseudo;
      client.socket.join(game.matchUUID);

      client = this.clientCustomQueue.shift();
      client.room = game.matchUUID;
      game.players[1].login = client.login;
      game.players[1].pseudo = client.pseudo;
      client.socket.join(game.matchUUID);
    }
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(socket: Socket) {
    let client = this.clients.find((c) => c.socket.id == socket.id);
    if (client == undefined) {
      console.log('GameGatewayRemoveFromQueue: Can not found client by id');
    }
    this.removePlayerFromQueue(client);
  }

  @SubscribeMessage('leaveRoom')
  removePlayerFromRoom(socket: Socket) {
    const client = this.clients.find((client) => (client.id = socket.id));
    client.socket.leave(client.room);
    client.room = undefined;
  }

  // Payload is login and isMovingUp/Down
  @SubscribeMessage('updatePlayers')
  updatePlayers(client: Socket, payload: any) {
    const playerName = payload.login;
    const playerMovingUp = payload.isMovingUp;
    const playerMovingDown = payload.isMovingDown;
    this.gameService.gameInProgress.forEach((game) => {
      if (game.players[0].login == playerName) {
        this.gameService.movePlayer(game, 0, playerMovingUp, playerMovingDown);
      } else if (game.players[1].login == playerName) {
        this.gameService.movePlayer(game, 1, playerMovingUp, playerMovingDown);
      }
    });
  }
}
