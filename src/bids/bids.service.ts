import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Bid } from './bid.entity';
import { ItemsService } from '../items/items.service';
import { UsersService } from '../users/users.service';
import { Item } from '../items/item.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    private readonly itemsService: ItemsService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async placeBid(itemId: number, userId: number, amount: number) {
    return await this.dataSource.transaction(async (manager) => {
      // Lock the item row for update (no joins!)
      const item = await manager
        .getRepository(Item)
        .createQueryBuilder('item')
        .setLock('pessimistic_write')
        .where('item.id = :id', { id: itemId })
        .getOne();

      if (!item) throw new NotFoundException('Item not found');

      const now = new Date();
      const auctionEnd = new Date(item.createdAt.getTime() + item.durationMinutes * 60 * 1000);
      if (now > auctionEnd) {
        throw new BadRequestException('Auction has already ended');
      }

      const user = await this.usersService.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // Fetch highest bid manually
      const highestBid = await manager
        .getRepository(Bid)
        .createQueryBuilder('bid')
        .select('MAX(bid.amount)', 'max')
        .where('bid.itemId = :itemId', { itemId })
        .getRawOne();

      const maxAmount = highestBid?.max ?? item.startingPrice;

      if (+amount <= +maxAmount) {
        throw new BadRequestException('Bid must be higher than current highest bid');
      }

      const bid = manager.getRepository(Bid).create({
        amount,
        item,
        user,
      });

      return manager.getRepository(Bid).save(bid);
    });
  }


  async getBidsForItem(itemId: number) {
    return this.bidRepo.find({
      where: { item: { id: itemId } },
      relations: ['user'],
      order: { amount: 'DESC' },
    });
  }
}
