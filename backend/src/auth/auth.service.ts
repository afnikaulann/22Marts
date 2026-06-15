import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await argon2.hash(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = await this.generateToken(user.id, user.email);

    return {
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Verify password
    let passwordValid = false;
    try {
      passwordValid = await argon2.verify(user.password, dto.password);
    } catch (error) {
      // If password is not a valid argon2 hash (e.g., plaintext from seeder), fallback to direct comparison
      passwordValid = user.password === dto.password;
    }

    if (!passwordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Generate token
    const token = await this.generateToken(user.id, user.email);

    return {
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async updateProfile(userId: string, data: { name?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return { message: 'Profil berhasil diupdate', user };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const valid = await argon2.verify(user.password, oldPassword);
    if (!valid) throw new UnauthorizedException('Password lama salah');

    const hashedPassword = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    console.log('[AuthService] Processing forgotPassword for:', dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Security: don't reveal if user exists
      return {
        message: 'Jika email terdaftar, link reset kata sandi akan dikirim.',
      };
    }

    // Generate token for reset password (expires in 15 minutes)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'reset-password' },
      { expiresIn: '15m' },
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    console.log(`[Resend] Mengirim email reset password ke: ${user.email}`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: '22Mart <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset Kata Sandi 22Mart',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #9333ea; text-align: center;">Reset Kata Sandi</h2>
            <p>Halo, <strong>${user.name}</strong></p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun 22Mart Anda.</p>
            <p>Silakan klik tombol di bawah ini untuk mereset kata sandi Anda. Link ini hanya berlaku selama 15 menit.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Kata Sandi</a>
            </div>
            <p>Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin link berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
            <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #888; font-size: 12px; text-align: center;">&copy; 2026 22Mart. All rights reserved.</p>
          </div>
        `,
      });

      if (error) {
        console.error('[Resend Error Details]:', JSON.stringify(error, null, 2));
        throw new InternalServerErrorException(
          `Gagal mengirim email: ${error.message}`,
        );
      }

      console.log(`[Resend Success] Email sent to ${user.email}. ID: ${data?.id}`);

      return {
        message: 'Link reset kata sandi telah dikirim ke email Anda.',
      };
    } catch (err) {
      console.error('[Resend Catch Block]:', err);
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mengirim email reset kata sandi',
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);

      if (payload.type !== 'reset-password') {
        throw new UnauthorizedException('Token tidak valid');
      }

      const hashedPassword = await argon2.hash(dto.newPassword);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'Kata sandi berhasil direset' };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException(
        'Token tidak valid atau sudah kadaluarsa',
      );
    }
  }

  private async generateToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }
}
