import { Module } from '@nestjs/common';
import { AttributionCron } from './statsCronAttribution';
import { LinksModule } from '../links/links.module';
@Module({ imports:[LinksModule], providers:[AttributionCron] })
export class CronModule {}
