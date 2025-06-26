import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Bid } from './bid.entity';
import { ItemsService } from '../items/items.service';
import { UsersService } from '../users/users.service';
import { Item } from '../items/item.entity';
// import { BidsGatewayService } from '../bids/gateway/bids-gateway.service';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    private readonly itemsService: ItemsService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    //  private readonly bidsGatewayService: BidsGatewayService
  ) { }

 async placeBid(itemId: number, userId: number, amount: number) {
  return this.dataSource.transaction(async (manager) => {
    const itemRepo = manager.getRepository(Item);
    const bidRepo = manager.getRepository(Bid);

    const item = await itemRepo.findOne({ where: { id: itemId } });

    if (!item) throw new NotFoundException('Item not found');

    const auctionEnd = new Date(item.createdAt.getTime() + item.durationMinutes * 60 * 1000);
    if (Date.now() > auctionEnd.getTime()) {
      throw new BadRequestException('Auction has already ended');
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const highestBid = await bidRepo
      .createQueryBuilder('bid')
      .select('MAX(bid.amount)', 'max')
      .where('bid.itemId = :itemId', { itemId })
      .getRawOne();

    const maxAmount = highestBid?.max ?? item.startingPrice;
    if (+amount <= +maxAmount) {
      throw new BadRequestException('Bid must be higher than current highest bid');
    }

    // Force update to ensure version locking
    item.updatedAt = new Date(); // Or update any other field
    try {
      await itemRepo.save(item); // This triggers version increment and check
    } catch (err) {
      if (err.name === 'OptimisticLockVersionMismatchError') {
        throw new ConflictException('Another bid was placed before yours. Try again.');
      }
      throw err;
    }

    const bid = bidRepo.create({ amount, item, user });
    return bidRepo.save(bid);
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
