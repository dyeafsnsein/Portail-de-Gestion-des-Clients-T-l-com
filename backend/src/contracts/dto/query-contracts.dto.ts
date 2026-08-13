import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContractStatus } from '../../generated/prisma/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryContractsDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Case-insensitive partial match on the related client email, firstName or lastName',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
