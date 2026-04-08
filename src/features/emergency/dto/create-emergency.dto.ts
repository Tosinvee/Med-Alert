import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum EmergencyType {
  MEDICAL = 'MEDICAL',
  ACCIDENT = 'ACCIDENT',
  FIRE = 'FIRE',
  OTHER = 'OTHER',
}

export class CreateEmergencyDto {
  @IsEnum(EmergencyType)
  type: EmergencyType;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;
}
