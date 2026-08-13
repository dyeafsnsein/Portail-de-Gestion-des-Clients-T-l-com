import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ResourceStatus, ResourceType } from '../../generated/prisma/enums';

export class CreateResourceDto {
  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty({ example: '89441123456789012345' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  iccid: string;

  @ApiProperty({ example: '250011234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  imsi: string;

  @ApiProperty({
    example: '+21620123456',
    description: 'Tunisian phone number in +216XXXXXXXX format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+216[0-9]{8}$/, {
    message: 'msisdn must match the Tunisian format +216XXXXXXXX',
  })
  msisdn: string;

  @ApiPropertyOptional({ enum: ResourceStatus })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @ApiPropertyOptional({ description: 'Contract this resource is assigned to' })
  @IsOptional()
  @IsString()
  contractId?: string;
}
