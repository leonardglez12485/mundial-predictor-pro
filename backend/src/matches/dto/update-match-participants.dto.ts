import { IsString, MinLength } from "class-validator";

export class UpdateMatchParticipantsDto {
  @IsString()
  @MinLength(1)
  homeTeamCode!: string;

  @IsString()
  @MinLength(1)
  awayTeamCode!: string;
}
