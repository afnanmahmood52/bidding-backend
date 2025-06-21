import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BidsService } from '../bids.service';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // <-- Inject BidsService here
  constructor(private readonly bidsService: BidsService) {}

  private subscriptions: Map<string, Set<string>> = new Map(); // itemId -> Set of socket IDs

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up all subscriptions for this socket
    for (const [itemId, sockets] of this.subscriptions.entries()) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.subscriptions.delete(itemId);
      }
    }
  }

  @SubscribeMessage('subscribeToItem')
  handleSubscribe(client: Socket, itemId: string) {
    if (!this.subscriptions.has(itemId)) {
      this.subscriptions.set(itemId, new Set());
    }
    this.subscriptions.get(itemId)?.add(client.id);
    console.log(`Client ${client.id} subscribed to item ${itemId}`);
  }

  @SubscribeMessage('unsubscribeFromItem')
  handleUnsubscribe(client: Socket, itemId: string) {
    this.subscriptions.get(itemId)?.delete(client.id);
    console.log(`Client ${client.id} unsubscribed from item ${itemId}`);
  }

  @SubscribeMessage('placeBid')
  handlePlaceBid(client: Socket, payload: { itemId: string; bidAmount: number; userId: string }) {
    const { itemId, bidAmount, userId } = payload;

    // TODO: Add bid validation and DB logic here

    // Broadcast to subscribers of this item
    const subscribers = this.subscriptions.get(itemId);
    if (subscribers) {
      subscribers.forEach(socketId => {
        this.server.to(socketId).emit('bidUpdate', {
          itemId,
          bid: { amount: bidAmount, userId, time: new Date() },
        });
      });
    }

    console.log(`Bid placed on item ${itemId} by user ${userId}: $${bidAmount}`);
  }

  @SubscribeMessage('requestItemBids')
  async handleRequestItemBids(client: Socket, itemId: string) {
   const id = Number(itemId);
    if (Number.isNaN(id)) {
      client.emit('itemBidsError', { message: 'Invalid itemId' });
      return;
    }

    try {
      const bids = await this.bidsService.getBidsForItem(id);

      console.log("bids-->", bids);

      client.emit('itemBids', { itemId: id, bids });
    } catch (err) {
      client.emit('itemBidsError', {
        itemId: id,
        message: err.message || 'Failed to fetch bids',
      });
    }
  }
}
