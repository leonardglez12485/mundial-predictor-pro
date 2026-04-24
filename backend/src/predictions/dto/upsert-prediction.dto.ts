import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsString, Min } from "class-validator";
import { PredictionWinner } from "@prisma/client";

export class UpsertPredictionDto {
  @IsEnum(PredictionWinner)
  winner!: PredictionWinner;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  homeGoals!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  awayGoals!: number;

  @IsArray()
  @IsString({ each: true })
  scorers!: string[];
}