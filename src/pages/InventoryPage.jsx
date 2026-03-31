import { useState, useEffect } from 'react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import { priceService } from '../features/inventory/api/priceService';
import { settingService } from '../common/api/settingService';
import { MealPlanner } from '../features/meal-planner/api/meal-planner';
import { DynamicBudgetConstraint } from '../features/meal-planner/api/constraint';

function InventoryPage() {
  const [data, setData] = useState({ foods: [], prices: {}, settings: {} });
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    setData({
      foods: recipeService.getRecipes(),
      prices: priceService.getPrices(),
      settings: settingService.getSettings()
    });
  }, []);

  return (
    <div className="page">
      <h2>📅 원가</h2>
    </div>
  );
}
export default InventoryPage;