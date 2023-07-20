import { Injectable } from '@nestjs/common';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { MyGateway } from './gateway';

const TIMEBEFOREOFFLINE: number = 2500;

@Injectable()
export class GatewayService {
  timeout: any[] = [];

  constructor(private dbWriter: DbWriterService, private gateway: MyGateway) {}

  async updateUserStatusOnline(login: string) {
    const user = await this.dbWriter.getDataUser(login);
    if (user.status == 'IN_GAME') {
        clearTimeout(this.timeout[login]);
        return ;
    }
    const statusOnline = { login: login, status: 'ONLINE' };
    this.dbWriter.changeStatus(statusOnline);
    this.gateway.server.emit('user-status-changed', statusOnline);
    clearTimeout(this.timeout[login]);
    this.timeout[login] = setTimeout(() => {
      const statusOffline = { login: login, status: 'OFFLINE' };
      this.dbWriter.changeStatus(statusOffline);
      this.gateway.server.emit('user-status-changed', statusOffline);
    }, TIMEBEFOREOFFLINE);
  }

  updateUserStatus(login: string, status: string) {
    const statusObj = { login: login, status: status };
    this.dbWriter.changeStatus(statusObj);
    this.gateway.server.emit('user-status-changed', statusObj);
  }
}
