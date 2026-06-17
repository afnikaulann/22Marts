import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || (request.headers['x-auth-token'] ? `Bearer ${request.headers['x-auth-token']}` : undefined);

    if (!authHeader) {
      console.log('[JwtAuthGuard] No authHeader found in request headers!');
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      console.log('[JwtAuthGuard] Invalid token format. authHeader:', authHeader);
      throw new UnauthorizedException('Format token tidak valid');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (err) {
      console.log('[JwtAuthGuard] verifyAsync failed!', err);
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
    }
  }
}
