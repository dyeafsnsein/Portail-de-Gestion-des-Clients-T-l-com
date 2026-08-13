import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderItemType } from '../../generated/prisma/enums';

export class CreateOrderItemDto {
  @ApiProperty({ enum: OrderItemType })
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({ example: 'Unlimited 4G' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  itemName: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 29.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  priceAtPurchase: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the client (User) placing the order',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
