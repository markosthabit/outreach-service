import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note, NoteSchema } from './schemas/note.schema';
import { Servantee, ServanteeSchema } from '../servantees/schemas/servantee.schema';
import { Retreat, RetreatSchema } from '../retreats/schemas/retreat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: Servantee.name, schema: ServanteeSchema },
      { name: Retreat.name, schema: RetreatSchema },
    ]),
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
