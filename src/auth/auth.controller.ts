import { Controller, Post, Body, BadRequestException, Res, UnauthorizedException, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { SigninResDto, SignupResDto } from './dto/res.dto';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { Request, Response } from 'express';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, SigninResDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiPostResponse(SignupResDto)
  @Post('signup/email')
  async signup(@Body() { email, password, nickname }: SignupReqDto): Promise<SignupResDto> {
    // if (password !== passwordConfirm) throw new BadRequestException('Password and PasswordConfirm is not matched.');
    const { id } = await this.authService.signup(email, password, nickname);
    return { id };
  }

  @Public()
  @ApiPostResponse(SigninResDto)
  @Post('signin/email')
  async signin(
    @Body() { email, password }: SigninReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SigninResDto> {
    const { accessToken, refreshToken } = await this.authService.signin(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
    // return this.authService.signin(email, password);
  }

  @Public()
  @ApiPostResponse(SigninResDto)
  @Get('refresh/token')
  async getAccessToken(@Req() request: Request, @Res({ passthrough: true }) res: Response) {
    const getRefreshToken = request.cookies['refreshToken'];

    if (!getRefreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }
    const { accessToken, refreshToken } = await this.authService.newAccessToken(getRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }
}
