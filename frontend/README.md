# Wasfa

Portuguese recipe website built with React and Vite. The original CSS, images, responsive layout, and HTML page URLs are preserved.

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the generated dist directory. Vite builds all seven HTML entries, so existing links such as /pages/receitas.html work on static hosting without rewrite rules.

## Structure

- src/pages: Home, Recipes, RecipeDetail, Login, Profile, About, Contact
- src/components: shared Header, Footer, SearchBar, CategoryFilters, RecipeCard, FavoriteButton, AuthPanel, AuthField
- src/context: shared authentication state
- src/data: recipe card data
- css/style.css: original design and responsive styles
- src/styles/react.css: small React layout and accessibility adaptations
- assets: original images, copied into production output by Vite

The mobile menu, rotating homepage wheel, favorites and notifications use React state and effects. Search and category filters work with the existing recipe data. Favorites persist in localStorage. The original demo authentication storage keys are retained so existing accounts continue to work. This remains a frontend demo: passwords are stored locally, and production authentication needs a backend.

The original recipe cards all link to the existing chicken recipe detail page. Profile shortcuts remain marked Em breve. The previously empty contact page now displays the shared layout and team heading.
