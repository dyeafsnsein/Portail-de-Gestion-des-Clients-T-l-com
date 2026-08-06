import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../../generated/prisma/enums';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class ServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ServiceType })
  type: ServiceType;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedServicesResponseDto {
  @ApiProperty({ type: [ServiceResponseDto] })
  items: ServiceResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
