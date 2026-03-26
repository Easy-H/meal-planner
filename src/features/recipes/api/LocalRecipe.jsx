const RECIPE_KEY = 'mp_recipes_data';

const LocalRecipe = {
    getRecipes: () => {
        const data = localStorage.getItem(RECIPE_KEY);
        return data ? JSON.parse(data) : [];
    },
    saveRecipes: (recipes) => {
        localStorage.setItem(RECIPE_KEY, JSON.stringify(recipes));
    },
    // 초기 샘플 데이터나 데이터 보정용
    validateRecipe: (recipe) => ({
        ...recipe,
        id: recipe.id || Date.now() + Math.random(),
        style: Array.isArray(recipe.style) ? recipe.style : [recipe.style || "기타"],
        ingredients: recipe.ingredients || {} // { "쌀": 200 } 형태
    })
};


export {LocalRecipe};