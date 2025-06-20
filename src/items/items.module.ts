import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item } from './item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({  
  imports: [TypeOrmModule.forFeature([Item])],
  providers: [ItemsService],
  controllers: [ItemsController],
  exports: [ItemsService], // ✅ Export for other modules
})
export class ItemsModule {}
