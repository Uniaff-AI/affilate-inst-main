import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { startOfDay, subDays } from "date-fns";

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async partnerOverview(userId: string, range: "7d" | "30d") {
    const partner = await this.prisma.partner.findUnique({ where: { userId } });
    const days = range === "7d" ? 7 : 30;
    const end = startOfDay(new Date());
    const start = subDays(end, days - 1);
    const series = await this.prisma.dailyMetric.findMany({
      where: { partnerId: partner!.id, date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    });
    const sum = (k: keyof (typeof series)[number]) =>
      series.reduce((a, b) => a + ((b as any)[k] || 0), 0);
    return {
      range,
      totals: {
        followers_total: series.length
          ? series[series.length - 1].followersTotal
          : 0,
        followers_delta_sum: sum("followersDeltaDay"),
        attributed_follows_sum: sum("attributedFollows"),
        clicks_sum: sum("clicks"),
        visits_sum: sum("visits"),
        ctr_avg: series.length
          ? series.reduce((a, b) => a + (b.ctr || 0), 0) / series.length
          : 0,
      },
      series,
    };
  }

  async partnerSeries(userId: string, days: number) {
    const partner = await this.prisma.partner.findUnique({ where: { userId } });
    const end = startOfDay(new Date());
    const start = subDays(end, days - 1);
    return this.prisma.dailyMetric.findMany({
      where: { partnerId: partner!.id, date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    });
  }
}
