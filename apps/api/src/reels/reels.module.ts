import { Module } from '@nestjs/common';
import { ReelsController } from './reels.controller';
import { StaticController } from './static.controller';
import { VideoService } from './video.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ 
  imports: [PrismaModule], 
  controllers: [ReelsController, StaticController],
  providers: [VideoService]
})
export class ReelsModule {}
