import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateCreditDto {
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  point: number;

  @IsNotEmpty()
  @IsNumber()
  terminalNumber: number;

  @IsNotEmpty()
  @IsString()
  weight: string;

  @IsNotEmpty()
  @IsString()
  materialDetails: string;

  @IsNotEmpty()
  @IsString()
  transactionDetails: string;

  @IsNotEmpty()
  @IsString()
  transactionType: string;
}
