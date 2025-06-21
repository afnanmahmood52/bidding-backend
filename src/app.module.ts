import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeederService } from './seeder/seeder.service';


import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { BidsModule } from './bids/bids.module';
import { User } from './users/user.entity';
// import { BidsGatewayModule } from './bids/gateway/bids-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // ⚠️ turn off in production
    }),
    TypeOrmModule.forFeature([User]), // 👈 Register User entity for SeederService
    UsersModule,
    ItemsModule,
    BidsModule,
    // BidsGatewayModule
  ],
  providers: [SeederService]
})
export class AppModule {}
