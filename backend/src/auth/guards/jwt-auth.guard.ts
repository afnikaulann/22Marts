import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try multiple sources for the token:
    // 1. Authorization header (standard)
    // 2. X-Auth-Token header (nginx fallback)
    // 3. Cookie (most reliable — nginx always forwards cookies)
    // 4. Query parameter ?token=xxx (last resort)
    let token: string | undefined;
    let source = 'none';

    // 1. Authorization: Bearer xxx
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, t] = authHeader.split(' ');
      if (type === 'Bearer' && t) {
        token = t;
        source = 'Authorization header';
      }
    }

    // 2. X-Auth-Token: xxx
    if (!token) {
      const xAuthToken = request.headers['x-auth-token'];
      if (typeof xAuthToken === 'string' && xAuthToken) {
        token = xAuthToken;
        source = 'X-Auth-Token header';
      }
    }

    // 3. Cookie: token=xxx
    if (!token) {
      const cookieHeader = request.headers.cookie;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, c) => {
          const [key, ...vals] = c.trim().split('=');
          acc[key] = vals.join('=');
          return acc;
        }, {} as Record<string, string>);
        if (cookies['token']) {
          token = cookies['token'];
          source = 'Cookie';
        }
      }
    }

    // 4. Query parameter: ?token=xxx
    if (!token) {
      const queryToken = request.query?.token;
      if (typeof queryToken === 'string' && queryToken) {
        token = queryToken;
        source = 'Query parameter';
      }
    }

    if (!token) {
      console.log('[JwtAuthGuard] NO TOKEN FOUND. Headers:', JSON.stringify(Object.keys(request.headers)));
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    console.log(`[JwtAuthGuard] Token found via: ${source}`);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (err) {
      console.log('[JwtAuthGuard] Token verification failed:', err?.message || err);
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
    }
  }
}
