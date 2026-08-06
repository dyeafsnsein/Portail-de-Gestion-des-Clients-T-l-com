import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResourceStatus, ResourceType } from '../../generated/prisma/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryResourcesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive partial match on iccid, imsi or msisdn',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiPropertyOptional({ enum: ResourceStatus })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @ApiPropertyOptional({
    description: 'Filter resources assigned to a contract',
  })
  @IsOptional()
  @IsString()
  contractId?: string;
}
