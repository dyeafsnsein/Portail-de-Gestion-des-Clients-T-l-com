import { ApiProperty } from '@nestjs/swagger';
import { AccessoryCategory } from '../../generated/prisma/enums';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class AccessoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AccessoryCategory })
  category: AccessoryCategory;

  @ApiProperty({ example: 19.99 })
  price: number;

  @ApiProperty({ example: 10 })
  stockQuantity: number;

  @ApiProperty({ type: String, nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedAccessoriesResponseDto {
  @ApiProperty({ type: [AccessoryResponseDto] })
  items: AccessoryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
