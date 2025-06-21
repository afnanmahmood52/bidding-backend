import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeederService } from './seeder/seeder.service';


import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { BidsModule } from './bids/bids.module';
import { User } from './users/user.entity';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // ⚠️ turn off in production
    }),
    TypeOrmModule.forFeature([User]), // 👈 Register User entity for SeederService
    UsersModule,
    ItemsModule,
    BidsModule,
    // allow 20 requests per 60 seconds per IP:
    ThrottlerModule.forRoot([
      {
        ttl: 60,      // Time to live (seconds)
        limit: 20,    // Max 20 requests per 60s per IP
      },
    ]),
  ],
  providers: [SeederService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ]
})
export class AppModule {}
