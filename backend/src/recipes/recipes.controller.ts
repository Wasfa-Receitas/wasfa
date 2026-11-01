import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { SearchRecipesDto } from './dto/search-recipes.dto';
import { RecipeIdDto } from './dto/recipe-id.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}
  @Get() search(@Query() query: SearchRecipesDto) { return this.recipes.search(query); }
  @Get(':id') detail(@Param() params: RecipeIdDto) { return this.recipes.detail(params.id); }
}
