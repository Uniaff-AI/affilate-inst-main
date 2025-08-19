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
    console.log('Starting daily followers count collection...');
    const partners = await this.prisma.partner.findMany();
    const day = startOfDay(new Date());
    
    for (const p of partners) {
      try {
        // Если нет igBusinessId, используем id партнера как fallback
        const businessId = p.igBusinessId || p.id;
        const cnt = await this.graph.followersCount(businessId);
        
        await this.prisma.dailySnapshot.upsert({
          where: { partnerId_date: { partnerId: p.id, date: day }},
          update: { followers: cnt },
          create: { partnerId: p.id, date: day, followers: cnt }
        });
        
        console.log(`Updated followers count for partner ${p.id}: ${cnt}`);
      } catch (error) {
        console.error(`Error updating followers count for partner ${p.id}:`, error.message);
      }
    }
    console.log('Daily followers count collection completed');
  }
}
