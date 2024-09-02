import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { RefreshToken } from './entity/refresh-token';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken) private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /** 회원가입 */
  async signup(email: string, password: string, nickname: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException('이미 가입된 이메일입니다.');

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const newUser = await this.userService.create(email, hashedPassword, nickname);
    return newUser;
  }

  /**로그인 */
  async signin(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    const refreshToken = this.generateToken(user.id, 'refresh');
    await this.createRefreshTokenUsingUser(user.id, refreshToken);

    return {
      accessToken: this.jwtService.sign({ sub: user.id }),
      refreshToken,
    };
  }

  async newAccessToken(refreshToken: string) {
    const verifyToken = this.verifyRefreshToken(refreshToken);

    const newRefreshToken = this.generateToken(verifyToken.sub, 'refresh');

    await this.createRefreshTokenUsingUser(verifyToken.sub, newRefreshToken);

    return {
      accessToken: this.jwtService.sign({ sub: verifyToken.sub }),
      refreshToken: newRefreshToken,
    };
  }

  private generateToken(userId: string, type: 'refresh' | 'access') {
    const payload = { sub: userId, tokenType: type };
    return this.jwtService.sign(payload, { expiresIn: type === 'refresh' ? '30d' : '1d' });
  }

  private async createRefreshTokenUsingUser(userId: string, refreshToken: string) {
    let refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (refreshTokenEntity) {
      refreshTokenEntity.token = refreshToken;
    } else {
      refreshTokenEntity = this.refreshTokenRepository.create({ user: { id: userId }, token: refreshToken });
    }
    await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  private verifyRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('토큰 타입이 알맞지 않습니다.');
      }

      if (!payload.sub) {
        throw new UnauthorizedException('토큰에 userId가 없습니다.');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
