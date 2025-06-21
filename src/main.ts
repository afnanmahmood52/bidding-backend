import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Allow frontend URL from .env
    credentials: true,
  });
  // Plug in the custom Socket.IO adapter
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
