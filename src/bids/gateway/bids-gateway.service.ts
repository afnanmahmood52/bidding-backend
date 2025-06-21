// src/bids/gateway/bids-gateway.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class BidsGatewayService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitBids(itemId: number, bids: any[]) {
    if (this.server) {
      this.server.emit(`bids/${itemId}`, bids);
    }
  }
}
