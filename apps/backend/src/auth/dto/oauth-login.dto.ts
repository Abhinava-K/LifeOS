import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'ID token issued by Google OAuth2 provider',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAi...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Full name of user obtained from Google profile (optional fallback)',
    example: 'Abhinava K',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}

export class AppleLoginDto {
  @ApiProperty({
    description: 'Identity token issued by Apple Sign-In provider',
    example: 'eyJraWQiOiJBSURPUDExMiIsImFsZyI6IlJTMjU2In...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Raw nonce string if raw nonce verification is enabled',
    example: 'nonce_sample_123456',
  })
  @IsString()
  @IsOptional()
  rawNonce?: string;

  @ApiPropertyOptional({
    description: 'User full name sent by Apple on first login',
    example: 'Abhinava K',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
