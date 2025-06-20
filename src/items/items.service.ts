import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private repo: Repository<Item>) {}

  async create(data: {
    name: string;
    description: string;
    startingPrice: number;
    durationMinutes: number;
  }) {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['bids'],
      order: { bids: { amount: 'DESC' } },
    });
  }

  async findAllWithHighestBids(page = 1, limit = 9) {
    const [items, total] = await this.repo.findAndCount({
      relations: ['bids'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const transformed = items.map((item) => {
      const endTime = new Date(item.createdAt.getTime() + item.durationMinutes * 60 * 1000);
      const highestBid = item.bids.reduce(
        (max, bid) => (+bid.amount > +max.amount ? bid : max),
        { amount: item.startingPrice } as any,
      );

      return {
        ...item,
        currentHighestBid: highestBid.amount,
        timeRemaining: Math.max(0, endTime.getTime() - Date.now()),
      };
    });

    return {
      items: transformed,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async remove(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      throw new Error(`Item with ID ${id} not found`);
    }
    return this.repo.remove(item);
  }
}
