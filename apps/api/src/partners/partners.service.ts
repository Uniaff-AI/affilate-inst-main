import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addHours } from 'date-fns';
import * as crypto from 'crypto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { partner: true },
    });
  }

  /** Generează o parolă simplă, fără caractere ciudate, comodă pentru copy */
  private genPwd(len = 10) {
    return crypto.randomBytes(24).toString('base64url').slice(0, len);
  }

  /** Atribuie IG și setează parola one‑time (TTL setabil) */
  async assignDemo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { partner: true },
    });
    if (!user?.partner) throw new NotFoundException('Partner not found');

    const partner = user.partner;
    const username =
        partner.igUsername ??
        `partner_${new Date().getFullYear()}_${Math.floor(Math.random() * 1000)}`;

    const password = this.genPwd(10);
    const ttlHours = Number(process.env.IG_PASSWORD_TTL_HOURS || 24);

    await this.prisma.partner.update({
      where: { id: partner.id },
      data: {
        igUsername: username,
        onboardingDone: false,
        igPasswordTmp: password,
        igPasswordTmpExpiresAt: addHours(new Date(), ttlHours),
        igPasswordTmpUsedAt: null,
      },
    });

    // Întoarcem imediat ca UI-ul să o prindă în Step 2
    return { igUsername: username, igPassword: password };
  }

  /** Returnează parola one‑time; dacă `consume=true` o golește imediat după livrare */
  async oneTimeCreds(userId: string, consume = true) {
    const p = await this.prisma.partner.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Partner missing');

    let pwd: string | null = p.igPasswordTmp ?? null;

    // Expirată?
    if (p.igPasswordTmpExpiresAt && p.igPasswordTmpExpiresAt < new Date()) {
      pwd = null;
    }

    // Consumă (șterge) după livrare
    if (pwd && consume) {
      await this.prisma.partner.update({
        where: { id: p.id },
        data: { igPasswordTmp: null, igPasswordTmpUsedAt: new Date() },
      });
    }

    return { igUsername: p.igUsername, igPassword: pwd };
  }

  async setIgInfo(partnerId: string, igBusinessId: string, igUsername: string) {
    return this.prisma.partner.update({
      where: { id: partnerId },
      data: { igBusinessId, igUsername },
    });
  }

  async completeOnboarding(userId: string) {
    const p = await this.prisma.partner.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Partner missing');

    await this.prisma.partner.update({
      where: { id: p.id },
      data: { onboardingDone: true },
    });
    return { ok: true };
  }
}
