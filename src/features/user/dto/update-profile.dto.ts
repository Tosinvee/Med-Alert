import { IsArray, IsOptional, IsString } from 'class-validator';

export class updateProfileDto {
  @IsOptional()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  dob: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies: string[];

  @IsOptional()
  @IsString()
  bloodType: string;

  @IsOptional()
  @IsString()
  name: string;
}
