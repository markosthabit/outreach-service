// users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'Admin',
  SERVANT = 'Servant',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user'
  })
  @Prop({ 
    required: [true, 'Email is required'],
    unique: true, 
    lowercase: true,
    trim: true
  })
  email: string;

  @Prop({ 
    required: [true, 'Password is required'],
    select: false,
    minlength: [8, 'Password must be at least 8 characters long']
  })
  password: string;

  @ApiProperty({ 
    enum: UserRole, 
    default: UserRole.SERVANT,
    description: 'User role (Admin or Servant)'
  })
  @Prop({ 
    type: String, 
    enum: {
      values: [UserRole.ADMIN, UserRole.SERVANT],
      message: 'Role must be either Admin or Servant'
    },
    default: UserRole.SERVANT
  })
  role: UserRole;

  @Prop({ type: String, select: false, required: false })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);   