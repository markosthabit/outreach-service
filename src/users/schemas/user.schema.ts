// users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['Admin', 'Servant'], default: 'Servant' })
  role: 'Admin' | 'Servant';
}

export const UserSchema = SchemaFactory.createForClass(User);
