import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RetreatsService } from './retreats.service';
import { RetreatsController } from './retreats.controller';
import { Retreat, RetreatSchema } from './schemas/retreat.schema';
import { Servantee, ServanteeSchema } from 'src/servantees/schemas/servantee.schema';
import { Note, NoteSchema } from 'src/notes/schemas/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Retreat.name, schema: RetreatSchema },
      { name: Servantee.name, schema: ServanteeSchema },
      { name: Note.name, schema: NoteSchema },

    ]),
  ],
  controllers: [RetreatsController],
  providers: [RetreatsService],
  exports: [RetreatsService],
})
export class RetreatsModule {}
