import { Type } from "class-transformer";
import { IsArray, IsInt, IsString, Min } from "class-validator";

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
  scorers!: string[];
}