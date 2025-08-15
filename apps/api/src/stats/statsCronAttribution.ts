import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LinksService } from '../links/links.service';
@Injectable()
export class AttributionCron {
  constructor(private links: LinksService) {}
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  run() { return this.links.runAttribution(new Date()); }
}
