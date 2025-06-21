import { Body, Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) { }

  @Post()
  async createItem(@Body() body: { name: string; description: string; startingPrice: number; durationMinutes: number }) {
    return this.itemsService.create(body);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 9) {
    return this.itemsService.findAllWithHighestBids(+page, +limit);
  }



  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }

}
