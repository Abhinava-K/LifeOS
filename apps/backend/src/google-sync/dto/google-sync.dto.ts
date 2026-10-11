import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoogleServiceType } from '@lifeos/shared-types';

export class GoogleConnectRequestDto {
  @ApiPropertyOptional({ description: 'Google OAuth2 authorization code' })
  @IsOptional()
  @IsString()
  authCode?: string;

  @ApiPropertyOptional({ description: 'Google account email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Requested OAuth permission scopes', type: [String] })
  @IsOptional()
  @IsArray()
  scopes?: string[];
}

export class GoogleSyncTriggerDto {
  @ApiPropertyOptional({
    enum: GoogleServiceType,
    isArray: true,
    description: 'Specific services to sync. Defaults to all enabled services.',
  })
  @IsOptional()
  @IsArray()
  services?: GoogleServiceType[];

  @ApiPropertyOptional({ description: 'Force full sync bypassing incremental delta checks', default: false })
  @IsOptional()
  @IsBoolean()
  forceFullSync?: boolean;
}
