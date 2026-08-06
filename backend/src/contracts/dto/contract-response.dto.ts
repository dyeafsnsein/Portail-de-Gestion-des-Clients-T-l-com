import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../../generated/prisma/enums';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class ContractResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty({ enum: ContractStatus })
  status: ContractStatus;

  @ApiProperty()
  type: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedContractsResponseDto {
  @ApiProperty({ type: [ContractResponseDto] })
  items: ContractResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
