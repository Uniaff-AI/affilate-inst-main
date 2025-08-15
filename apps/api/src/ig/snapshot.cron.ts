import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GraphService } from './graph.service';
import { startOfDay } from 'date-fns';

@Injectable()
export class SnapshotCron {
  constructor(private prisma: PrismaService, private graph: GraphService) {}
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async collect() {
    const partners = await this.prisma.partner.findMany({ where: { igBusinessId: { not: null } }});
    const day = startOfDay(new Date());
    for (const p of partners) {
      const cnt = await this.graph.followersCount(p.igBusinessId!);
      await this.prisma.dailySnapshot.upsert({
        where: { partnerId_date: { partnerId: p.id, date: day }},
        update: { followers: cnt },
        create: { partnerId: p.id, date: day, followers: cnt }
      });
    }
  }
}
