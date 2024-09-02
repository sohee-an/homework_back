import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength } from 'class-validator';

export class SignupReqDto {
  @ApiProperty({ required: true, example: 'nestjs@test.com' })
  @IsEmail()
  @MaxLength(30)
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  password: string;

  @ApiProperty({ required: true, example: 'test' })
  @MaxLength(10)
  nickname: string;

  // ChatGPT
  // Please explain the JavaScript regular expression below
  // /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/
  // Please translate the above into Korean
  // @NotIncludeNickname()
  // @ApiProperty({ required: true, example: 'Password1!' })
  // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  // passwordConfirm: string;
}

export class SigninReqDto {
  @ApiProperty({ required: true, example: 'nestjs@fastcampus.com' })
  @IsEmail()
  @MaxLength(30)
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  password: string;
}
