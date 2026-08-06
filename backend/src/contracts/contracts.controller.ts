import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../generated/prisma/enums';
import type { ContractModel } from '../generated/prisma/models';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginated } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContractsService } from './contracts.service';
import {
  ContractResponseDto,
  PaginatedContractsResponseDto,
} from './dto/contract-response.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({
    summary: 'List contracts with pagination, search and status filter (ADMIN)',
  })
  @ApiOkResponse({ type: PaginatedContractsResponseDto })
  findAll(
    @Query() query: QueryContractsDto,
  ): Promise<Paginated<ContractModel>> {
    return this.contractsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one contract (ADMIN)' })
  @ApiOkResponse({ type: ContractResponseDto })
  findOne(@Param('id') id: string): Promise<ContractModel> {
    return this.contractsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a contract (ADMIN)' })
  @ApiCreatedResponse({ type: ContractResponseDto })
  create(@Body() dto: CreateContractDto): Promise<ContractModel> {
    return this.contractsService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a contract (ADMIN)' })
  @ApiOkResponse({ type: ContractResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
  ): Promise<ContractModel> {
    return this.contractsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a contract -> status TERMINATED (ADMIN)',
  })
  @ApiOkResponse({ type: ContractResponseDto })
  remove(@Param('id') id: string): Promise<ContractModel> {
    return this.contractsService.remove(id);
  }
}
