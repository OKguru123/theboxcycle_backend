import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class DeductCreditDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  deductPoints: any;
}
