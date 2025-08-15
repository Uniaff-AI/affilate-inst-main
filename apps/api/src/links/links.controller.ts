import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { LinksService } from './links.service';
import { Response } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class RedirectController {
  constructor(private links: LinksService, private prisma: PrismaService) {}

  @UseGuards(JwtGuard)
  @Post('partner/links')
  async create(@Req() req, @Body() utm: any) {
    const p = await this.prisma.partner.findUnique({ where: { userId: req.user.sub }});
    if (!p) throw new Error('Partner missing');
    return this.links.createLink(p.id, utm);
  }

  @UseGuards(JwtGuard)
  @Get('partner/links')
  async list(@Req() req) {
    const p = await this.prisma.partner.findUnique({ where: { userId: req.user.sub }});
    return this.prisma.link.findMany({ where: { partnerId: p!.id }, orderBy: { createdAt: 'desc' }});
  }

  @Get('l/:slug')
  async go(@Param('slug') slug: string, @Req() req, @Res() res: Response, @Query() _q) {
    const ua = req.get('user-agent'); const ip = req.ip; const ref = req.get('referer');
    const link = await this.links.recordClick({ slug, ua, ip, ref });
    await this.links.recordVisit(link.id, /Instagram|Android|iPhone/i.test(ua ?? '') ? 'app' : 'web');

    const uname = link.igUser.igUsername || '';
    const appUrl = `instagram://user?username=${encodeURIComponent(uname)}`;
    const webUrl = `https://instagram.com/${encodeURIComponent(uname)}`;
    res.status(302).send(
      `<html><head><meta http-equiv="refresh" content="0;url=${appUrl}">
      <script>setTimeout(()=>location.replace('${webUrl}'),300)</script></head>
      <body>Redirecting to Instagram…</body></html>`
    );
  }
}
