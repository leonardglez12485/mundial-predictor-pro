import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePlayerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(["P", "DEF", "MED", "DEL"])
  position?: string;
}