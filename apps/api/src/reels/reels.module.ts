import { Module } from '@nestjs/common';
import { ReelsController } from './reels.controller';
import { PrismaModule } from '../prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[ReelsController] })
export class ReelsModule {}
