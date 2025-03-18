import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateScanDto {
  @IsNotEmpty()
  @IsString()
  QRCode: string;

  @IsNotEmpty()
  @IsBoolean()
  IsRead: boolean;
}
