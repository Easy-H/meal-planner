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

  const generate = () => {
    const planner = new MealPlanner({
      ...data.settings,
      foods: data.foods,
      ingredientPrices: data.prices,
      startDate: '2026-03-24', // 필요시 input으로 관리
      endDate: '2026-03-30',
      totalBudget: 100000
    });
    planner.addConstraints(new DynamicBudgetConstraint(100000));
    setPlan(planner.generate());
  };

  return (
    <div className="page">
      <h2>📅 주간 식단 시뮬레이션</h2>
      <button className="primary-btn" onClick={generate}>새 식단 생성</button>
      {plan && Object.entries(plan).map(([date, meals]) => (
          <div key={date} className="day-plan">
            <h3>{date}</h3>
            {meals.map((meal, idx) => (
              <p key={idx}>{meal.name} (₩{meal.totalCost?.toLocaleString()})</p>
            ))}
          </div>
        ))}
    </div>
  );
}
export default InventoryPage;