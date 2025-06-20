import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bid } from './bid.entity';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';

import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    ItemsModule,
    UsersModule, // ✅ this brings in UsersService properly,
  ],
  providers: [BidsService],
  controllers: [BidsController],
})
export class BidsModule {}
