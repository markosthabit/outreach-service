import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema'; // Make sure this path is correct

export type ServanteeDocument = Servantee & Document;

@Schema({ timestamps: true })
export class Servantee {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  phone: string;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  @Prop()
  birthDate: Date;

  @ApiProperty({ required: false })
  @Prop()
  education: string;

  @ApiProperty({ required: false })
  @Prop()
  work: string;

  @ApiProperty({ required: false })
  @Prop()
  church: string;

  @ApiProperty({ type: [String], format: 'date-time', required: false })
  @Prop({ type: [Date] })
  retreatDates: Date[];

  @ApiProperty({ type: [String], required: false })
  @Prop([String])
  notes: string[];

  @ApiProperty({ default: true })
  @Prop({ default: true })
  isActive: boolean;

  // 👇 Added fields for lightweight audit tracking
  @ApiProperty({ description: 'User who created this record', type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy: User | Types.ObjectId;

  @ApiProperty({ description: 'User who last updated this record', type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy: User | Types.ObjectId;
}

export const ServanteeSchema = SchemaFactory.createForClass(Servantee);
