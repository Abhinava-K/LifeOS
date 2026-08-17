import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '@lifeos/shared-types';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdatePrivacyDto {
  @ApiPropertyOptional({ enum: ProfileVisibility, description: 'Profile visibility' })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @ApiPropertyOptional({ description: 'Consent for data processing' })
  @IsOptional()
  @IsBoolean()
  dataProcessingConsent?: boolean;

  @ApiPropertyOptional({ description: 'Consent for marketing emails' })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional({ description: 'Consent for analytics tracking' })
  @IsOptional()
  @IsBoolean()
  analyticsConsent?: boolean;
}