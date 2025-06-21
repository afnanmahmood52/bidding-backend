import { INestApplicationContext } from '@nestjs/common';
import {
  AbstractWsAdapter,
  MessageMappingProperties,
} from '@nestjs/websockets';
import { DISCONNECT_EVENT } from '@nestjs/websockets/constants';
import { fromEvent } from 'rxjs';
import { share, first, mergeMap, filter, map, takeUntil } from 'rxjs/operators';
import { Server } from 'socket.io';

export class SocketIoAdapter extends AbstractWsAdapter {
  constructor(
    appOrHttpServer?: INestApplicationContext | any,
    private readonly corsOrigins: string[] = [],
  ) {
    super(appOrHttpServer);
  }

  create(port: number, options?: any & { namespace?: string; server?: any }) {
    if (!options) {
      return this.createIOServer(port);
    }
    const { namespace, server, ...opt } = options;
    return server?.of
      ? server.of(namespace)
      : namespace
      ? this.createIOServer(port, opt).of(namespace)
      : this.createIOServer(port, opt);
  }

  createIOServer(port: number, options?: any) {
    if (this.httpServer && port === 0) {
      return new Server(this.httpServer, {
        cors: {
          origin: this.corsOrigins,
          methods: ['GET', 'POST'],
          credentials: true,
        },
        maxHttpBufferSize: 1e6,
      });
    }
    return new Server(port, options);
  }

  bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => any,
  ) {
    const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(share(), first());

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(client, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload);
          return transform(callback(data, ack)).pipe(
            filter((response: any) => response != null),
            map((response: any) => [response, ack]),
          );
        }),
        takeUntil(disconnect$),
      );

      source$.subscribe(([response, ack]) => {
        if (response.event) {
          client.emit(response.event, response.data);
        } else if (typeof ack === 'function') {
          ack(response);
        }
      });
    });
  }

  mapPayload(payload: any): { data: any; ack?: any } {
    if (!Array.isArray(payload)) {
      return { data: payload };
    }
    const last = payload[payload.length - 1];
    if (typeof last === 'function') {
      const data = payload.slice(0, -1);
      return { data: data.length > 1 ? data : data[0], ack: last };
    }
    return { data: payload };
  }
}