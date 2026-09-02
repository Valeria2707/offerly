import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token returned by Google Identity Services' })
  @IsString()
  idToken!: string;
}
