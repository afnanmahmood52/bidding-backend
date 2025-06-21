import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BidsService } from '../bids.service';

@WebSocketGateway({ cors: true })
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bidsService: BidsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToItem')
  handleSubscribeToItem(@MessageBody() itemId: number, @ConnectedSocket() client: Socket) {
    client.join(`item-${itemId}`);
  }

  @SubscribeMessage('unsubscribeFromItem')
  handleUnsubscribeFromItem(@MessageBody() itemId: number, @ConnectedSocket() client: Socket) {
    client.leave(`item-${itemId}`);
  }

  @SubscribeMessage('requestItemBids')
  async handleRequestItemBids(@MessageBody() itemId: number, @ConnectedSocket() client: Socket) {
    const bids = await this.bidsService.getBidsForItem(itemId);
    this.server.to(`item-${itemId}`).emit(`bids/${itemId}`, bids);
  }

  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @MessageBody()
    payload: { itemId: number; userId: number; amount: number },
  ) {
    await this.bidsService.placeBid(payload.itemId, payload.userId, payload.amount);
    const updatedBids = await this.bidsService.getBidsForItem(payload.itemId);
    this.server.to(`item-${payload.itemId}`).emit(`bids/${payload.itemId}`, updatedBids);
  }
}
