import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document } from 'mongoose';

export type ServanteeDocument = Servantee & Document;

@Schema({ timestamps: true })
export class Servantee {
  @Prop({required: true, unique: true})
  phone: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  birthDate: Date;

  @Prop()
  education: string;

  @Prop()
  work: string;

  @Prop()
  church: string;

  @Prop()
  retreatDates: [Date];

  @Prop()
  notes: [string];

  @Prop({ default: true })
  isActive: boolean;
}

export const ServanteeSchema = SchemaFactory.createForClass(Servantee);
