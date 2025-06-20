import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userRepo.count();
    if (count >= 100) return;

    const users = Array.from({ length: 100 }).map((_, i) =>
      this.userRepo.create({ name: `User ${i + 1}` }),
    );

    await this.userRepo.save(users);
    console.log('✅ Seeded 100 users');
  }
}
