export class MealPlanner {

    constructor(config) {
        this.config = config; // config.schedule: { 1: 3, 6: 2 } (월:3끼, 토:2끼) 형태 포함
        this.strategies = [];
        this.history = [];
        this.fixedSchedule = {};
    }
    
    addConstraints(strategy) {
        if (strategy.init) strategy.init(this); // 전략이 초기화를 필요로 하면 실행
        this.strategies.push(strategy);
    }
    
    addFixedMeal(date, index, name) {
        if (!this.fixedSchedule[date]) this.fixedSchedule[date] = {};
        this.fixedSchedule[date][index] = name;
    }

    // 요일별 식사 횟수 가져오기 (0: 일요일, 6: 토요일)
    getMealsPerDay(date) {
        const dayOfWeek = date.getDay();
        return this.config.schedule?.[dayOfWeek] ?? this.config.mealsPerDay;
    }
    
    getTotalMealSlots() {
        let count = 0;
        let curr = new Date(this.config.startDate);
        const end = new Date(this.config.endDate);
        while (curr <= end) {
            count += this.getMealsPerDay(curr);
            curr.setDate(curr.getDate() + 1);
        }
        return count;
    }

    generate() {
        const { startDate, endDate, foods } = this.config;
        const result = {};
        this.history = [];

        // 1. 확정 식단 히스토리 선등록
        Object.entries(this.fixedSchedule).forEach(([date, meals]) => {
            Object.entries(meals).forEach(([idx, name]) => {
                const food = foods.find(f => f.name === name) || { name, ingredients: {} };
                this.history.push({
                    date, mealIndex: parseInt(idx),
                    foodNames: [food.name],
                    ingredients: new Set(Object.keys(food.ingredients || {})), isFixed: true
                });
            });
        });

        let curr = new Date(startDate);
        while (curr <= new Date(endDate)) {
            const dateStr = curr.toISOString().split('T')[0];
            const mealsNeeded = this.getMealsPerDay(curr);

            // [수정] 식사가 0인 경우에도 null이 아닌 빈 배열 []을 할당하여 에러 방지
            result[dateStr] = [];

            if (mealsNeeded > 0) {
                for (let i = 0; i < mealsNeeded; i++) {
                    let finalMeal;
                    const fixedName = this.fixedSchedule[dateStr]?.[i];

                    if (fixedName) {
                        const food = foods.find(f => f.name === fixedName) || { name: fixedName, ingredients: {} };
                        finalMeal = {
                            name: fixedName, items: [food], isFixed: true,
                            totalCost: this.calculateCost(food),
                            allIngredients: new Set(Object.keys(food.ingredients || {}))
                        };
                    } else {
                        finalMeal = this.findBestMeal(dateStr, i, mealsNeeded);
                    }

                    this.strategies.forEach(s => s.updateState?.(finalMeal.totalCost || 0));

                    if (!finalMeal.error) {
                        this.history.push({
                            date: dateStr, mealIndex: i,
                            foodNames: finalMeal.items.map(it => it.name),
                            ingredients: finalMeal.allIngredients, isFixed: !!finalMeal.isFixed
                        });
                    }
                    result[dateStr].push(finalMeal);
                }
            }
            curr.setDate(curr.getDate() + 1);
        }
        return result;
    }

    findBestMeal(dateStr, mealIndex) {
        const historyNames = this.history.flatMap(h => h.foodNames || []);

        // [필터링 1] 금지 재료 목록 도출 (MealIntervalConstraint 기반)
        const bannedIngredients = new Set();
        const intervalConstraints = this.strategies.filter(s => s.ingredientName);

        intervalConstraints.forEach(constraint => {
            const currentAbsIdx = constraint.getAbsoluteIndex(dateStr, mealIndex, this.config.mealsPerDay);
            for (const record of this.history) {
                const recordAbsIdx = constraint.getAbsoluteIndex(record.date, record.mealIndex, this.config.mealsPerDay);
                const diff = Math.abs(currentAbsIdx - recordAbsIdx);
                if (diff > 0 && diff <= constraint.minMealInterval) {
                    if (record.ingredients && record.ingredients.has(constraint.ingredientName)) {
                        bannedIngredients.add(constraint.ingredientName);
                    }
                }
            }
        });

        // [필터링 2] 현재 예산 상한선 도출
        const budgetConstraint = this.strategies.find(s => s.getCurrentMaxLimit);
        const maxLimit = budgetConstraint ? budgetConstraint.getCurrentMaxLimit() : Infinity;

        // [탐색 최적화] 스타일별 그룹 탐색
        const allStyles = [...new Set(this.config.foods.flatMap(f => f.style || ["기타"]))];
        let bestOverallSet = null;
        let highestScore = -Infinity;

        allStyles.forEach(targetStyle => {
            // 금지 재료 포함 메뉴 및 예산 초과 메뉴 원천 배제
            const safePool = this.config.foods.filter(f => {
                const isStyleMatch = (f.style || []).includes(targetStyle);
                const isPriceOk = this.calculateCost(f) <= maxLimit;
                const isBanned = Object.keys(f.ingredients || {}).some(ing => bannedIngredients.has(ing));
                return isStyleMatch && isPriceOk && !isBanned;
            });

            for (let attempt = 0; attempt < 30; attempt++) {
                if (safePool.length === 0) break;
                const candidate = this.createMealSet(safePool);
                const context = {
                    history: this.history, historyNames, currentDate: dateStr,
                    currentMealIndex: mealIndex, mealsPerDay: this.config.mealsPerDay,
                    calculateCost: (t) => this.calculateCost(t)
                };

                let totalScore = 0;
                let isValid = true;
                for (const strategy of this.strategies) {
                    const res = strategy.evaluate(candidate, context);
                    if (!res.isValid) { isValid = false; break; }
                    totalScore += res.score;
                }

                if (isValid && totalScore > highestScore) {
                    highestScore = totalScore;
                    bestOverallSet = { ...candidate, totalCost: this.calculateCost(candidate) };
                }
            }
        });
        return bestOverallSet || { 
                name: "생성 실패", 
                items: [], // 빈 배열 보장
                totalCost: 0, 
                error: true 
            };
    }

    createMealSet(pool) {
        const { categories } = this.config;
        const items = categories.map(cat => {
            const catPool = pool.filter(f => f.category === cat);
            const finalPool = catPool.length > 0 ? catPool : this.config.foods.filter(f => f.category === cat);
            return finalPool[Math.floor(Math.random() * finalPool.length)];
        });
        return {
            items,
            name: items.map(i => i.name).join(", "),
            allIngredients: new Set(items.flatMap(i => Object.keys(i.ingredients || {})))
        };
    }

    calculateCost(target) {
        const items = Array.isArray(target) ? target : (target.items || [target]);
        return items.reduce((sum, item) => {
            if (!item.ingredients) return sum;
            return sum + Object.entries(item.ingredients).reduce((s, [n, w]) =>
                s + (this.config.ingredientPrices[n] * w / 100), 0);
        }, 0);
    }
}