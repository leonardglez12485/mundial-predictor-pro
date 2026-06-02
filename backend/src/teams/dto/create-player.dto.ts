import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreatePlayerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(["P", "DEF", "MED", "DEL"])
  position?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  club?: string;
}
