import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScanDto {
  @IsNotEmpty()
  @IsString()
  QRCode: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}
