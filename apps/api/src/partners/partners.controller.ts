import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { PartnersService } from './partners.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('partner')
@UseGuards(JwtGuard)
export class PartnersController {
  constructor(
      private partners: PartnersService,
      private prisma: PrismaService,
  ) {}

  @Get('me')
  me(@Req() req) {
    return this.partners.me(req.user.sub);
  }

  @Post('assign-demo')
  assignDemo(@Req() req) {
    return this.partners.assignDemo(req.user.sub);
  }

  /** Fallback pentru Step 2: ia parola din DB (o singură dată).
   *  /partner/credentials?consume=0 -> nu consumă (rareori necesar)
   */
  @Get('credentials')
  credentials(@Req() req, @Query('consume') consume?: string) {
    const doConsume = consume !== '0';
    return this.partners.oneTimeCreds(req.user.sub, doConsume);
  }

  @Post('complete-onboarding')
  complete(@Req() req) {
    return this.partners.completeOnboarding(req.user.sub);
  }

  // ADMIN: setează IG real (opțional)
  @Post('set-ig')
  async setIg(
      @Req() req,
      @Body()
          dto: { partnerId: string; igBusinessId: string; igUsername: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
    });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('ADMIN only');
    return this.partners.setIgInfo(
        dto.partnerId,
        dto.igBusinessId,
        dto.igUsername,
    );
  }
}
