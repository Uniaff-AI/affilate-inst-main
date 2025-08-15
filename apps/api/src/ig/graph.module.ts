import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { SnapshotCron } from './snapshot.cron';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports:[PrismaModule], providers:[GraphService, SnapshotCron], exports:[GraphService] })
export class GraphModule {}
