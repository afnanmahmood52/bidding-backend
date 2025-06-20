import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  async createItem(@Body() body: { name: string; description: string; startingPrice: number; durationMinutes: number }) {
    return this.itemsService.create(body);
  }

  @Get()
  async getAllItems() {
    return this.itemsService.findAllWithHighestBids();
  }

  

  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }

}
