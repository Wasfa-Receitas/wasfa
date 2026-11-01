import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class SearchRecipesDto {
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(100)
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string'
    ? [...new Set(value.split(',').map((term) => term.trim().toLowerCase()).filter(Boolean))]
    : null)
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  ingredients?: string[];

  @Transform(({ value }) => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : NaN)
  @IsInt()
  @Min(1)
  @Max(100000)
  page = 1;

  @Transform(({ value }) => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : NaN)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
