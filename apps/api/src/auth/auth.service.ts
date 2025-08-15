import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({ where: { OR: [{ email: dto.email }, { phone: dto.phone ?? '' }] }});
    if (exists) throw new BadRequestException('User exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ data: { email: dto.email, phone: dto.phone, passwordHash, name: dto.name ?? null, locale: dto.locale ?? 'en' }});
    const partner = await this.prisma.partner.create({ data: { userId: user.id }});
    return this.issue(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.emailOrPhone }, { phone: dto.emailOrPhone }] },
      include: { partner: true }
    });
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();
    return this.issue(user);
  }

  private issue(user: any) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    return { accessToken, user: { id: user.id, email: user.email, role: user.role, partnerId: user.partner?.id } };
  }
}
