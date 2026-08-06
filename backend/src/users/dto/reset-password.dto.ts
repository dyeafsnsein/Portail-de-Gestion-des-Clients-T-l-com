import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
