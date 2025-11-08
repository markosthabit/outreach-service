import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Servantee } from '../../servantees/schemas/servantee.schema';
import { Retreat } from '../../retreats/schemas/retreat.schema';

@Schema({collection: 'notes', timestamps: true })
export class Note extends Document {
  @ApiProperty({
    example: 'This is a note about the servantee.',
    description: 'Content of the note',
  })
  @Prop({ required: true, trim: true })
  content: string;

  @ApiProperty({
    description: 'The Servantee this note is about',
    type: () => Servantee,
  })
  @Prop({ type: Types.ObjectId, ref: 'Servantee' })
  servanteeId: Types.ObjectId;

  @ApiProperty({
    description: 'The Retreat this note is associated with (optional)',
    type: () => Retreat,
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'Retreat' })
  retreatId?: Types.ObjectId;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

NoteSchema.pre('save', function (next) {
  if (!this.servanteeId && !this.retreatId) {
    return next(
      new Error('A note must be associated with a servantee or a retreat.'),
    );
  }
  if (this.servanteeId && this.retreatId) {
    return next(
      new Error(
        'A note cannot be associated with both a servantee and a retreat.',
      ),
    );
  }
  next();
});
