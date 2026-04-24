import { Type } from "class-transformer";
import { IsInt, IsString, Min } from "class-validator";

export class UpsertSpecialPredictionDto {
  @IsString()
  championCode!: string;

  @IsString()
  topScorer!: string;

  @IsString()
  finalHomeCode!: string;

  @IsString()
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