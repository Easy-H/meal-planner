export class MealPlanner {
    constructor(config) {
        this.config = config;
        this.strategies = [];
        this.history = [];
        this.fixedSchedule = {};
    }

    addConstraints(strategy) {
        if (strategy.init) strategy.init(this);
        this.strategies.push(strategy);
    }

    getMealsPerDay(date) {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
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

    // generate() 메서드 내부 로직 수정 제안
    generate(existingPlan = {}) {
        const { startDate, endDate, foods } = this.config;
        const result = { ...existingPlan }; // 기존에 저장된(수동 지정된) 식단 복사
        this.history = [];

        // 1. 기존 식단을 히스토리에 먼저 등록 (중복 방지 및 제약 조건 계산용)
        Object.entries(existingPlan).forEach(([date, meals]) => {
            meals.forEach((meal, idx) => {
                if (meal && !meal.error) {
                    this.history.push({
                        date, mealIndex: idx,
                        foodNames: meal.items.map(it => it.name),
                        ingredients: meal.allIngredients,
                        isFixed: true
                    });
                }
            });
        });

        let curr = new Date(startDate);
        while (curr <= new Date(endDate)) {
            const dateStr = curr.toISOString().split('T')[0];
            const mealsNeeded = this.getMealsPerDay(curr);

            if (!result[dateStr]) result[dateStr] = Array(mealsNeeded).fill(null);

            for (let i = 0; i < mealsNeeded; i++) {
                // 이미 식단이 채워져 있다면 스킵 (수동 지정 및 이전 생성 결과 보존)
                if (result[dateStr][i] && !result[dateStr][i].error) continue;

                // 비어있는 슬롯만 생성
                const finalMeal = this.findBestMeal(dateStr, i);

                this.strategies.forEach(s => s.updateState?.(finalMeal.totalCost || 0));

                if (!finalMeal.error) {
                    this.history.push({
                        date: dateStr, mealIndex: i,
                        foodNames: finalMeal.items.map(it => it.name),
                        ingredients: finalMeal.allIngredients
                    });
                }
                result[dateStr][i] = finalMeal;
            }
            curr.setDate(curr.getDate() + 1);
        }
        return result;
    }

    findBestMeal(dateStr, mealIndex) {
        const historyNames = this.history.flatMap(h => h.foodNames || []);

        // 1. 금지 재료 계산
        const bannedIngredients = new Set();
        this.strategies.filter(s => s.ingredientName).forEach(constraint => {
            const currentAbsIdx = constraint.getAbsoluteIndex(dateStr, mealIndex, this.config.mealsPerDay);
            for (const record of this.history) {
                const recordAbsIdx = constraint.getAbsoluteIndex(record.date, record.mealIndex, this.config.mealsPerDay);
                if (Math.abs(currentAbsIdx - recordAbsIdx) <= constraint.minMealInterval) {
                    if (record.ingredients?.has(constraint.ingredientName)) {
                        bannedIngredients.add(constraint.ingredientName);
                    }
                }
            }
        });

        // 2. 예산 상한선
        const budgetConstraint = this.strategies.find(s => s.getCurrentMaxLimit);
        const maxLimit = budgetConstraint ? budgetConstraint.getCurrentMaxLimit() : Infinity;

        // 3. 스타일 추출 (없으면 "기타" 부여)
        const allStyles = [...new Set(this.config.foods.flatMap(f =>
            (f.style && f.style.length > 0) ? f.style : ["기타"]
        ))];

        let bestOverallSet = null;
        let highestScore = -Infinity;
        let lastFailureReason = "";

        allStyles.forEach(targetStyle => {
            // 해당 스타일에 맞는 안전한 음식 풀 생성
            const safePool = this.config.foods.filter(f => {
                const fStyles = (f.style && f.style.length > 0) ? f.style : ["기타"];
                const isStyleMatch = fStyles.includes(targetStyle);
                const isPriceOk = this.calculateCost(f) <= maxLimit;
                const isBanned = Object.keys(f.ingredients || {}).some(ing => bannedIngredients.has(ing));
                return isStyleMatch && isPriceOk && !isBanned;
            });

            if (safePool.length === 0) {
                lastFailureReason = `${targetStyle} 스타일: 조건(예산/재료)에 맞는 음식이 없음`;
                return;
            }

            for (let attempt = 0; attempt < 20; attempt++) {
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
            items: [],
            totalCost: 0,
            error: true,
            reason: lastFailureReason || "모든 스타일에서 적합한 조합을 찾지 못함"
        };
    }

    createMealSet(pool) {
        const { categories } = this.config;
        const items = categories.map(cat => {
            // 1. 우선 safePool(스타일/예산 충족)에서 찾기
            let catPool = pool.filter(f => f.category === cat);
            // 2. 없으면 전체 음식 중 해당 카테고리에서 찾기 (완전 실패 방지)
            if (catPool.length === 0) {
                catPool = this.config.foods.filter(f => f.category === cat);
            }
            // 3. 그것도 없으면 더미 데이터 반환
            if (catPool.length === 0) {
                return { name: `미등록(${cat})`, ingredients: {}, category: cat };
            }
            return catPool[Math.floor(Math.random() * catPool.length)];
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
            const itemCost = Object.entries(item.ingredients).reduce((s, [n, w]) => {
                const price = this.config.ingredientPrices[n] || 0;
                return s + (price * w / 100);
            }, 0);
            return sum + itemCost;
        }, 0);
    }
}