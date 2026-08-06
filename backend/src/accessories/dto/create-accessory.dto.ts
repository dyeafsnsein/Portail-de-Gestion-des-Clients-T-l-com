import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AccessoryCategory } from '../../generated/prisma/enums';

export class CreateAccessoryDto {
  @ApiProperty({ example: 'Galaxy S25 Case' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: AccessoryCategory })
  @IsEnum(AccessoryCategory)
  category: AccessoryCategory;

  @ApiProperty({ example: 19.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stockQuantity: number;
}
