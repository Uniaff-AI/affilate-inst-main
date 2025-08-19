import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { SnapshotCron } from './snapshot.cron';
import { GraphController } from './graph.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ 
  imports: [PrismaModule], 
  providers: [GraphService, SnapshotCron], 
  controllers: [GraphController],
  exports: [GraphService] 
})
export class GraphModule {}
