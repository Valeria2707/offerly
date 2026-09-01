import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'olena.k@example.com' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'One-time token received by email' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'new-strong-password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
