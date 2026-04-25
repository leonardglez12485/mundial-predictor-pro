import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(["P", "DEF", "MED", "DEL"])
  position?: string;
}