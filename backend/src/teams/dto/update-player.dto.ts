import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

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
}