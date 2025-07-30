import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '@prisma/client';

export class SignupDto {
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(UserType)
  userType;
}
