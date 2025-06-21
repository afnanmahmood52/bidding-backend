import { Module, forwardRef  } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { BidsModule } from '../bids.module';

@Module({
      imports: [forwardRef(() => BidsModule)],
    providers: [EventsGateway],
})
export class EventsModule {}