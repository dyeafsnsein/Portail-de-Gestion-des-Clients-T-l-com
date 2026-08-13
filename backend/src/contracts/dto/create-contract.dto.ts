import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContractStatus } from '../../generated/prisma/enums';

export class CreateContractDto {
  @ApiProperty({
    description: 'ID of the client (User) this contract belongs to',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'Postpaid 4G' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-01-01T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
