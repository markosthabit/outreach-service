import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServanteesModule } from './servantees/servantees.module';

@Module({
  imports: [ServanteesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
