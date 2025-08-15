import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LinksModule } from '../links/links.module';
import { CronModule } from './statsCron.module';
@Module({ imports:[PrismaModule, LinksModule, CronModule], controllers:[StatsController], providers:[StatsService] })
export class StatsModule {}
