import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const h = req.headers['authorization'] || '';
    const t = Array.isArray(h) ? h[0] : h;
    const token = t?.startsWith('Bearer ') ? t.slice(7) : null;
    if (!token) throw new UnauthorizedException();
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      return true;
    } catch { throw new UnauthorizedException(); }
  }
}
