import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, VersionColumn, UpdateDateColumn } from 'typeorm';
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

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column()
  durationMinutes: number;

  @VersionColumn({ default: 1 })
  version: number;

  @OneToMany(() => Bid, (bid) => bid.item)
  bids: Bid[];
}
