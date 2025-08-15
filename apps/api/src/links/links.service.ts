import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addHours, startOfDay, subDays } from 'date-fns';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async createLink(partnerId: string, utm: any) {
    const slug = Math.random().toString(36).slice(2, 8);
    return this.prisma.link.create({ data: { partnerId, slug, ...utm }});
  }

  async recordClick({ slug, ua, ip, ref }: any) {
    const link = await this.prisma.link.findUnique({ where: { slug }, include: { igUser: true }});
    if (!link) throw new Error('Link not found');
    await this.prisma.click.create({ data: { linkId: link.id, ua, ip, ref }});
    return link;
  }

  recordVisit(linkId: string, platform?: string) {
    return this.prisma.visit.create({ data: { linkId, platform }});
  }

  async runAttribution(date: Date) {
    const h = Number(process.env.ATTRIBUTION_WINDOW_HOURS || 72);
    const from = addHours(date, -h);
    const day = startOfDay(date);

    const partners = await this.prisma.partner.findMany();
    for (const p of partners) {
      const clicks = await this.prisma.click.count({ where: { link: { partnerId: p.id }, ts: { gte: from, lt: date }}});
      const visits = await this.prisma.visit.count({ where: { link: { partnerId: p.id }, ts: { gte: from, lt: date }}});
      const snapToday = await this.prisma.dailySnapshot.findUnique({ where: { partnerId_date: { partnerId: p.id, date: day }}});
      const snapPrev = await this.prisma.dailySnapshot.findUnique({ where: { partnerId_date: { partnerId: p.id, date: startOfDay(subDays(date,1)) }}});
      const total = snapToday?.followers ?? 0;
      const delta = (snapToday?.followers ?? 0) - (snapPrev?.followers ?? 0);
      const attributed = clicks>0 ? Math.max(0, delta) : 0;

      await this.prisma.dailyMetric.upsert({
        where: { partnerId_date: { partnerId: p.id, date: day }},
        update: { followersTotal: total, followersDeltaDay: delta, attributedFollows: attributed, clicks, visits, ctr: clicks? visits/clicks : 0 },
        create: { partnerId: p.id, date: day, followersTotal: total, followersDeltaDay: delta, attributedFollows: attributed, clicks, visits, ctr: clicks? visits/clicks : 0 }
      });
    }
  }
}
