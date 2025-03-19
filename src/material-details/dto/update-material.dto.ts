import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateMaterialDto {
  @IsNotEmpty()
  @IsNumber()
  aluminum: number;

  @IsNotEmpty()
  @IsNumber()
  plastic: number;

  @IsNotEmpty()
  @IsNumber()
  glass: number;
}
