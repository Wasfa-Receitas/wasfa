import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class RecipeIdDto {
  @Transform(({ value }) => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : NaN)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  id!: number;
}
