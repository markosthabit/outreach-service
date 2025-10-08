import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Servantee } from 'src/servantees/schemas/servantee.schema';
import { Note } from 'src/notes/schemas/note.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Retreat extends Document {
  @ApiProperty({
    example: 'Summer Retreat 2025',
    description: 'Name of the retreat'
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: '2025-06-01T00:00:00.000Z',
    description: 'Start date of the retreat'
  })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({
    example: '2025-06-07T00:00:00.000Z',
    description: 'End date of the retreat'
  })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of Servantee IDs attending the retreat',
    type: [String]
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Servantee' }],
    default: [],
  })
  attendees: Types.ObjectId[];

  @ApiProperty({
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of Note IDs associated with the retreat',
    type: [String]
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Note' }],
    default: [],
  })
  notes: Types.ObjectId[];
}

export const RetreatSchema = SchemaFactory.createForClass(Retreat);
