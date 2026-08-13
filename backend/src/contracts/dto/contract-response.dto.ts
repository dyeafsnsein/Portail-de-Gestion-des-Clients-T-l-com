import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus } from '../../generated/prisma/enums';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class ContractClientDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  firstName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastName: string | null;
}

export class ContractResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty({ type: ContractClientDto })
  client: ContractClientDto;

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
