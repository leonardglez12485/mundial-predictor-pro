import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateMatchResultDto {
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
  homeScorers!: string[];

  @IsArray()
  @IsString({ each: true })
  awayScorers!: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  homePenaltyGoals?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  awayPenaltyGoals?: number;
}
