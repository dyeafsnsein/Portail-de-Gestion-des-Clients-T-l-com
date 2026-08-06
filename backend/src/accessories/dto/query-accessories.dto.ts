import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccessoryCategory } from '../../generated/prisma/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryAccessoriesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive partial match on name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AccessoryCategory })
  @IsOptional()
  @IsEnum(AccessoryCategory)
  category?: AccessoryCategory;
}
