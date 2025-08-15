import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { StatsService } from './stats.service';
import { Response } from 'express';

@Controller('stats')
@UseGuards(JwtGuard)
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('partner/overview')
  overview(@Req() req, @Query('range') range: '7d'|'30d' = '7d') {
    return this.stats.partnerOverview(req.user.sub, range);
  }

  @Get('partner/export.csv')
  async exportCsv(@Req() req, @Res() res: Response) {
    const rows = await this.stats.partnerSeries(req.user.sub, 30);
    const csv = ['date,followers_total,followers_delta_day,attributed_follows,clicks,visits,ctr']
      .concat(rows.map(r => `${r.date.toISOString().slice(0,10)},${r.followersTotal},${r.followersDeltaDay},${r.attributedFollows},${r.clicks},${r.visits},${r.ctr.toFixed(4)}`))
      .join('\n');
    res.setHeader('Content-Type','text/csv'); res.send(csv);
  }
}
