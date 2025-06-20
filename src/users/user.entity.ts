import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bid } from '../bids/bid.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn() // Auto-increment integer ID
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[];
}
