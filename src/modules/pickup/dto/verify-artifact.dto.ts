import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { VerificationArtifactType } from '@prisma/client';

export class VerifyArtifactDto {
  @ApiProperty({
    enum: VerificationArtifactType,
    example: VerificationArtifactType.PARCEL,
  })
  @IsEnum(VerificationArtifactType)
  type: VerificationArtifactType;

  @ApiProperty({
    description: 'Public URL of uploaded file',
    example: 'https://cdn.app.com/uploads/file.jpg',
    maxLength: 2048,
  })
  @Transform(({ value }) => value?.trim())
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'fileUrl must be a valid HTTP/HTTPS URL' },
  )
  @MaxLength(2048)
  fileUrl: string;
}