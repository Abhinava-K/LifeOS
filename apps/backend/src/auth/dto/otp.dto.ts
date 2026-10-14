import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User or Google email address to receive OTP' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Optional display or Google full name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this request originated from Google Sign-In' })
  @IsBoolean()
  @IsOptional()
  isGoogle?: boolean;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User or Google email address' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP verification code' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Optional display or Google full name' })
  @IsString()
  @IsOptional()
  fullName?: string;
}
