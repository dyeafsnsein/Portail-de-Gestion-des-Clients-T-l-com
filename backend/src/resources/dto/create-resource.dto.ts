import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @ApiProperty({ example: '+31612345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
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
