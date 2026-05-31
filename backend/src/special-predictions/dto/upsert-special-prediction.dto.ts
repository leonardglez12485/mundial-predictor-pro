import { Type } from "class-transformer";
import { IsInt, IsString, MaxLength, Min, MinLength } from "class-validator";

export class UpsertSpecialPredictionDto {
  @IsString()
  @MinLength(1)
  championCode!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  topScorer!: string;

  @IsString()
  @MinLength(1)
  finalHomeCode!: string;

  @IsString()
  @MinLength(1)
  finalAwayCode!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  finalHomeGoals!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  finalAwayGoals!: number;
}
