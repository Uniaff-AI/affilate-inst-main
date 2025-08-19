import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { GraphService } from './graph.service';
import { SnapshotCron } from './snapshot.cron';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('ig')
export class GraphController {
  constructor(
    private graphService: GraphService,
    private snapshotCron: SnapshotCron,
  ) {}

  @Post('collect-followers')
  @UseGuards(JwtGuard)
  async collectFollowers() {
    console.log('Manual followers collection triggered');
    await this.snapshotCron.collect();
    return { success: true, message: 'Followers collection completed' };
  }

  // Тестовый эндпоинт только для разработки
  @Get('test-followers')
  async testFollowers() {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Not available in production' };
    }
    const count = await this.graphService.testFollowersCount();
    return { testFollowersCount: count };
  }

  @Post('collect-followers-public')
  @UseGuards(JwtGuard)
  async collectFollowersPublic() {
    console.log('Manual followers collection triggered');
    await this.snapshotCron.collect();
    return { success: true, message: 'Followers collection completed' };
  }

  @Post('run-attribution')
  @UseGuards(JwtGuard)
  async runAttribution() {
    console.log('Manual attribution triggered');
    const { LinksService } = await import('../links/links.service');
    const { PrismaService } = await import('../prisma/prisma.service');
    const prisma = new PrismaService();
    const linksService = new LinksService(prisma);
    await linksService.runAttribution(new Date());
    return { success: true, message: 'Attribution completed' };
  }

  // Только для разработки - НЕ ИСПОЛЬЗОВАТЬ В ПРОДАКШЕНЕ
  @Post('dev/collect-followers')
  async devCollectFollowers() {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Not available in production' };
    }
    console.log('Dev followers collection triggered');
    await this.snapshotCron.collect();
    return { success: true, message: 'Dev followers collection completed' };
  }

  @Post('dev/run-attribution')
  async devRunAttribution() {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Not available in production' };
    }
    console.log('Dev attribution triggered');
    const { LinksService } = await import('../links/links.service');
    const { PrismaService } = await import('../prisma/prisma.service');
    const prisma = new PrismaService();
    const linksService = new LinksService(prisma);
    await linksService.runAttribution(new Date());
    return { success: true, message: 'Dev attribution completed' };
  }

  @Get('stats-test')
  @UseGuards(JwtGuard)
  async statsTest() {
    const { PrismaService } = await import('../prisma/prisma.service');
    const prisma = new PrismaService();
    
    const partner = await prisma.partner.findFirst();
    if (!partner) {
      return { error: 'No partner found' };
    }

    const metrics = await prisma.dailyMetric.findMany({
      where: { partnerId: partner.id },
      orderBy: { date: 'desc' },
      take: 1
    });

    return {
      partnerId: partner.id,
      latestMetrics: metrics[0] || null,
      totalMetrics: metrics.length
    };
  }
}
