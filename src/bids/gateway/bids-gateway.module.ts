// src/bids/gateway/bids-gateway.module.ts
import { Module } from '@nestjs/common';
import { BidsGateway } from './bids.gateway';
import { BidsGatewayService } from './bids-gateway.service';

@Module({
  providers: [BidsGateway, BidsGatewayService],
  exports: [BidsGatewayService]
})
export class BidsGatewayModule {}