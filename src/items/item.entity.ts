import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Bid } from '../bids/bid.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  startingPrice: number;

   @CreateDateColumn({ type: 'timestamp' }) // this replaces `startTime`
  createdAt: Date;

  @Column()
  durationMinutes: number;

  @OneToMany(() => Bid, (bid) => bid.item)
  bids: Bid[];
}
