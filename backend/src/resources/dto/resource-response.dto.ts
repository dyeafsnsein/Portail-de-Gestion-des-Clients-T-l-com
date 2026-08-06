import { ApiProperty } from '@nestjs/swagger';
import { ResourceStatus, ResourceType } from '../../generated/prisma/enums';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class ResourceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ResourceType })
  type: ResourceType;

  @ApiProperty()
  iccid: string;

  @ApiProperty()
  imsi: string;

  @ApiProperty()
  msisdn: string;

  @ApiProperty({ enum: ResourceStatus })
  status: ResourceStatus;

  @ApiProperty({ type: String, nullable: true })
  contractId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedResourcesResponseDto {
  @ApiProperty({ type: [ResourceResponseDto] })
  items: ResourceResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
