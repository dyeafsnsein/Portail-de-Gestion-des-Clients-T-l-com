import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;

  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ enum: SortDirection, default: SortDirection.DESC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDir: SortDirection = SortDirection.DESC;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export function paginate<T>(
  items: T[],
  totalItems: number,
  dto: PaginationDto,
): Paginated<T> {
  return {
    items,
    meta: {
      page: dto.page,
      pageSize: dto.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / dto.pageSize),
    },
  };
}

export function parseSort<T extends string>(
  dto: PaginationDto,
  allowed: readonly T[],
): Record<string, SortDirection> {
  const key = allowed.includes(dto.sortBy as T)
    ? (dto.sortBy as T)
    : ('createdAt' as T);
  return { [key]: dto.sortDir };
}

export function paginationSkip(dto: PaginationDto): number {
  return (dto.page - 1) * dto.pageSize;
}
