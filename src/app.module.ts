import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServanteesModule } from './servantees/servantees.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RetreatsModule } from './retreats/retreats.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    ServanteesModule,
    UsersModule,
    AuthModule,
    RetreatsModule,
    NotesModule,
  ],
})
export class AppModule {}
