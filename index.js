import { MealPlanner } from "./meal-planner/meal-planner.js";
import * as _ from "./meal-planner/constraint.js";
import { CalendarRenderer } from "./calendar-renderer.js";

const generateBtn = document.querySelector("#generate");
const startDate = document.querySelector("#start-date");
const endDate = document.querySelector("#end-date");
const budget = document.querySelector("#budget");

// 날짜 초기화 로직 (동일)
function getDate(addedDay = 0) {
    const target = new Date();
    target.setDate(target.getDate() + addedDay);
    return target.toISOString().split('T')[0];
}

startDate.value = getDate();
endDate.value = getDate(7);

generateBtn?.addEventListener('click', () => {
    
    const inputData = {
        startDate: startDate.value,
        endDate: endDate.value,
        schedule: {
            1: 3, 2: 3, 3: 3, 4: 3, 5: 3, // 월~금 3끼
            6: 2, // 토요일 브런치데이(2끼)
            0: 0  // 일요일 휴무
        },
        totalBudget: parseInt(budget.value),
        categories: ["주식", "국", "메인반찬", "밑반찬"],
        ingredientPrices: { "쌀": 300, "돼지고기": 2000, "김치": 800, "된장": 500, "고등어": 1500, "무": 200 },
        inventory: { "김치": 1000 },
        foods: [
            { name: "제육볶음", style:["한식"], category: "메인반찬", ingredients: { "돼지고기": 150 }, nutrition: { protein: 25 } },
            { name: "돈까스", style:["한식"], category: "메인반찬", ingredients: { "돼지고기": 200 }, nutrition: { protein: 20 } },
            { name: "흰밥", style:["한식"], category: "주식", ingredients: { "쌀": 200 }, nutrition: { protein: 5 } },
            { name: "된장국", style:["한식"], category: "국", ingredients: { "된장": 20, "무": 30 }, nutrition: { protein: 5 } },
            { name: "배추김치", style:["한식"], category: "밑반찬", ingredients: { "김치": 50 }, nutrition: { protein: 2 } },
            { name: "고등어구이", style:["한식"], category: "메인반찬", ingredients: { "고등어": 150 }, nutrition: { protein: 22 } }
        ]
    };

    const planner = new MealPlanner(inputData);
    
    // [수정] 이제 totalSlots를 외부에서 계산해 넣지 않아도 됩니다.
    planner.addConstraints(new _.DynamicBudgetConstraint(inputData.totalBudget));
    planner.addConstraints(new _.MealIntervalConstraint("돼지고기", 1));
    planner.addConstraints(new _.RepetitionPenaltyStrategy(-10));
    planner.addConstraints(new _.NutritionConstraint(30));

    planner.addFixedMeal("2026-03-03", 0, "제육볶음");
    
    const myMealPlan = planner.generate();
    new CalendarRenderer("#result").render(myMealPlan);
});