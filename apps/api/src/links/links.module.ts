import { Module } from '@nestjs/common';
import { RedirectController } from './links.controller';
import { LinksService } from './links.service';
import { PrismaModule } from '../prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[RedirectController], providers:[LinksService], exports:[LinksService] })
export class LinksModule {}
