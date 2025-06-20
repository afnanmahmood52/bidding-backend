import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  amount: number;

  @ManyToOne(() => Item, (item) => item.bids, { eager: true, onDelete: 'CASCADE' })
  item: Item;

  @ManyToOne(() => User, (user) => user.bids, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
