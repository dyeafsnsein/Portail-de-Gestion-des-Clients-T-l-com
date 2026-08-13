import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/enums';
import type {
  UserSelect,
  UserUpdateInput,
  UserWhereInput,
} from '../generated/prisma/models';
import {
  Paginated,
  paginate,
  paginationSkip,
  parseSort,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SafeUser } from '../auth/dto/auth-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  avatarUrl: true,
  firstName: true,
  lastName: true,
  phone: true,
  birthDate: true,
  address: true,
  createdAt: true,
  updatedAt: true,
} satisfies UserSelect;

const SORTABLE_COLUMNS = ['email', 'role', 'createdAt', 'updatedAt'] as const;

@Injectable()
export class UsersService {
  private readonly bcryptRounds = 10;

  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUsersDto): Promise<Paginated<SafeUser>> {
    const where: UserWhereInput = {};
    if (query.search) {
      where.email = { contains: query.search, mode: 'insensitive' };
    }
    if (query.role) {
      where.role = query.role;
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: paginationSkip(query),
        take: query.pageSize,
        orderBy: parseSort(query, SORTABLE_COLUMNS),
        select: USER_SELECT,
      }),
    ]);

    return paginate(items, totalItems, query);
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const password = await bcrypt.hash(dto.password, this.bcryptRounds);
    return this.prisma.user.create({
      data: {
        email,
        password,
        role: dto.role ?? Role.USER,
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        phone: dto.phone?.trim() || null,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        address: dto.address?.trim() || null,
      },
      select: USER_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.ensureExists(id);

    const data: UserUpdateInput = {};
    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase();
    }
    if (dto.role !== undefined) {
      data.role = dto.role;
    }
    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, this.bcryptRounds);
    }
    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName?.trim() || null;
    }
    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName?.trim() || null;
    }
    if (dto.phone !== undefined) {
      data.phone = dto.phone?.trim() || null;
    }
    if (dto.birthDate !== undefined) {
      data.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    }
    if (dto.address !== undefined) {
      data.address = dto.address?.trim() || null;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.user.delete({ where: { id } });
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<SafeUser> {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: USER_SELECT,
    });
  }

  async resetPassword(
    id: string,
    dto: ResetPasswordDto,
    actorId: string,
  ): Promise<SafeUser> {
    await this.ensureExists(id);

    const password = await bcrypt.hash(dto.password, this.bcryptRounds);
    const user = await this.prisma.user.update({
      where: { id },
      data: { password },
      select: USER_SELECT,
    });

    this.logger.log(`Password reset for user ${id} by admin ${actorId}`);
    return user;
  }

  private async ensureExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
