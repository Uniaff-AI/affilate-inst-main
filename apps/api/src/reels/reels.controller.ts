import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ForbiddenException,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createReadStream, statSync } from 'fs';

const uploadsRoot = '/app/uploads';
const uploadDir = join(uploadsRoot, 'reels');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@Controller('reels')
@UseGuards(JwtGuard)
export class ReelsController {
  constructor(
    private prisma: PrismaService,
    private videoService: VideoService
  ) {}

  @Get()
  list() {
    return this.prisma.reel.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('upload')
  @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: uploadDir,
          filename: (_req, file, cb) =>
              cb(
                  null,
                  `${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2)}${extname(file.originalname)}`
              ),
        }),
        limits: { fileSize: 200 * 1024 * 1024 },
      }),
  )
  async upload(
      @Req() req,
      @UploadedFile() file: Express.Multer.File,
      @Body() meta: any,
  ) {
    console.log('Upload request received:', { filename: file?.filename, size: file?.size, meta });
    
    const me = await this.prisma.user.findUnique({ where: { id: req.user.sub } });
    if (me?.role !== 'ADMIN') throw new ForbiddenException('ADMIN only');

    // Автоматически определяем длительность видео
    let durationSec = Number(meta.durationSec || 0);
    try {
      const videoPath = join(uploadDir, file.filename);
      console.log('Video path:', videoPath);
      durationSec = await this.videoService.getVideoDuration(videoPath);
      console.log('Duration detected:', durationSec);
    } catch (error) {
      console.error('Failed to get video duration:', error);
      // Используем значение из формы как fallback
    }

    // Генерируем превью
    let previewPath = meta.previewPath ?? null;
    try {
      const videoPath = join(uploadDir, file.filename);
      const thumbnailName = `thumb_${file.filename.replace(/\.[^/.]+$/, '.jpg')}`;
      const thumbnailPath = join(uploadDir, thumbnailName);
      await this.videoService.generateThumbnail(videoPath, thumbnailPath);
      previewPath = `/reels/${thumbnailName}`;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
    }

    const reel = await this.prisma.reel.create({
      data: {
        title: meta.title,
        locale: meta.locale ?? 'en',
        durationSec: durationSec,
        tags: (meta.tags ?? '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean),
        hashtags: (meta.hashtags ?? '')
            .split(',')
            .map((s: string) => s.trim().replace(/^#/, '')),
        description: meta.description ?? null,
        filePath: `/reels/${file.filename}`,
        previewPath: previewPath,
      },
    });
    return { ok: true, reel, downloadUrl: `/files${reel.filePath}` };
  }

  /** DOWNLOAD: streaming as attachment */
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const reel = await this.prisma.reel.findUnique({
      where: { id },
      select: { filePath: true, title: true },
    });
    if (!reel?.filePath) throw new NotFoundException('Reel not found');

    // sanitize relative path like "reels/xxx.mp4"
    const safeRel = reel.filePath.replace(/^[/\\]+/, '');
    if (safeRel.includes('..')) throw new ForbiddenException('Bad path');

    const abs = join(uploadsRoot, safeRel);
    if (!existsSync(abs)) throw new NotFoundException('File not found');

    const stats = statSync(abs);
    const downloadName =
        (reel.title || 'reel').replace(/[^\w\-]+/g, '_') + extname(abs);

    res.setHeader('Content-Type', mimeByExt(extname(abs)));
    res.setHeader('Content-Length', String(stats.size));
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return createReadStream(abs).pipe(res);
  }


}

function mimeByExt(ext: string) {
  const e = ext.toLowerCase();
  if (e === '.mp4') return 'video/mp4';
  if (e === '.mov') return 'video/quicktime';
  if (e === '.webm') return 'video/webm';
  if (e === '.m4v') return 'video/x-m4v';
  if (e === '.avi') return 'video/x-msvideo';
  return 'application/octet-stream';
}
