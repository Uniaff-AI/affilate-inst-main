import {
  Controller,
  Get,
  Options,
  Param,
  Res,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { extname, join } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';

const uploadsRoot = '/app/uploads';

@Controller('static')
export class StaticController {
  /** SERVE: static files (thumbnails, videos) */
  @Get('*')
  async serveFile(@Param('0') path: string, @Res() res: Response) {
    console.log('Static file request:', path);
    // sanitize path
    const safePath = path.replace(/^[/\\]+/, '').replace(/\.\./g, '');
    if (!safePath) throw new ForbiddenException('Bad path');

    const abs = join(uploadsRoot, safePath);
    console.log('Looking for file:', abs);
    if (!existsSync(abs)) throw new NotFoundException('File not found');

    const stats = statSync(abs);
    const ext = extname(abs);

    res.setHeader('Content-Type', this.mimeByExt(ext));
    res.setHeader('Content-Length', String(stats.size));
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return createReadStream(abs).pipe(res);
  }

  private mimeByExt(ext: string) {
    const e = ext.toLowerCase();
    if (e === '.mp4') return 'video/mp4';
    if (e === '.mov') return 'video/quicktime';
    if (e === '.webm') return 'video/webm';
    if (e === '.m4v') return 'video/x-m4v';
    if (e === '.avi') return 'video/x-msvideo';
    if (e === '.jpg' || e === '.jpeg') return 'image/jpeg';
    if (e === '.png') return 'image/png';
    if (e === '.gif') return 'image/gif';
    return 'application/octet-stream';
  }
}
