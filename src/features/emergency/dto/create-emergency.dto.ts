import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmergencyDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;
}
