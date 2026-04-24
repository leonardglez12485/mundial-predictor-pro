import { IsISO8601, IsOptional, IsString, Length } from "class-validator";

export class CreateMatchDto {
  @IsString()
  homeTeamCode!: string;

  @IsString()
  awayTeamCode!: string;

  @IsISO8601()
  kickoff!: string;

  @IsOptional()
  @IsString()
  @Length(1, 3)
  group?: string;
}