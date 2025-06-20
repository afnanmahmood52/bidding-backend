import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BidsService } from './bids.service';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  async placeBid(@Body() body: { itemId: number; userId: number; amount: number }) {
    return this.bidsService.placeBid(body.itemId, body.userId, body.amount);
  }

  @Get(':itemId')
  async getBids(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.bidsService.getBidsForItem(itemId);
  }
}
