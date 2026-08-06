import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../auth/dto/auth-response.dto';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
