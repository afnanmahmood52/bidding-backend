import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bid } from './bid.entity';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';

import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';
import { BidsGatewayModule } from './gateway/bids-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    ItemsModule,
    UsersModule
  ],
  providers: [BidsService, BidsService],
  controllers: [BidsController],
})
export class BidsModule {}
