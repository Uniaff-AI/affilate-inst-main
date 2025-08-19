import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PartnersModule } from './partners/partners.module';
import { ReelsModule } from './reels/reels.module';
import { LinksModule } from './links/links.module';
import { StatsModule } from './stats/stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphModule } from './ig/graph.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    PartnersModule,
    ReelsModule,
    LinksModule,
    StatsModule,
    GraphModule,
  ],
})
export class AppModule {}
