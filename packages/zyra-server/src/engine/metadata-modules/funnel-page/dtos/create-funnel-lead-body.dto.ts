import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// REST-only shape for the public lead-capture endpoint (funnel-public.controller.ts).
// Deliberately separate from CreateFunnelLeadInput (the GraphQL input): this
// endpoint has no auth guard, so its validation needs to be stricter
// (email format, length caps) than what the authenticated GraphQL mutation
// side requires.
export class CreateFunnelLeadBodyDto {
  @IsUUID()
  @IsNotEmpty()
  funnelPageId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  whatsapp: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  utmSource?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  utmMedium?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  utmCampaign?: string;
}
