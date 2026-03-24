/**
 * [Strategy 1] 동적 이월 예산 제약 (Hard)
 * 예산 상태를 스스로 관리하며, 상한선 초과 시 isValid: false를 반환합니다.
 */
export class DynamicBudgetConstraint {
    constructor(totalBudget) {
        this.totalBudget = totalBudget;
        this.totalSavings = 0;
        this.processedCount = 0;
    }

    // 플래너가 전략을 추가할 때 호출하여 초기 설정 수행
    init(planner) {
        this.totalSlots = planner.getTotalMealSlots();
        this.baseLimitPerMeal = this.totalBudget / this.totalSlots;
    }

    // 식단이 하나 확정될 때마다 플래너가 호출해줍니다.
    updateState(actualCost) {
        this.totalSavings += (this.baseLimitPerMeal - actualCost);
        this.processedCount++;
    }

    evaluate(mealSet, context) {
        const currentCost = context.calculateCost(mealSet);
        const mealsLeft = this.totalSlots - this.processedCount;
        
        // 현재 끼니에서 절대 넘지 말아야 할 상한선 (y + x/n)
        const currentMaxLimit = this.baseLimitPerMeal + (this.totalSavings / (mealsLeft || 1));

        if (currentCost > currentMaxLimit) {
            return { isValid: false, score: 0 };
        }

        // 상한선에 근접할수록 가산점 (예산을 효율적으로 사용하도록 유도)
        const score = (currentCost / currentMaxLimit) * 15;
        return { isValid: true, score };
    }
}

export class RepetitionPenaltyStrategy {
    constructor(penaltyPerMatch = -1000000) {
        this.penaltyPerMatch = penaltyPerMatch;
    }

    evaluate(mealSet, context) {
        const { historyNames } = context; // 과거에 먹은 모든 음식 이름 리스트 (중복 포함)
        if (!historyNames || historyNames.length === 0) return { isValid: true, score: 0 };

        let totalPenalty = 0;
        const currentFoodNames = mealSet.items.map(item => item.name);

        currentFoodNames.forEach(currentName => {
            // 과거 기록을 전부 뒤져서 일치하는 횟수만큼 벌점 누적
            const matchCount = historyNames.filter(pastName => pastName === currentName).length;
            if (matchCount > 0) {
                totalPenalty += (matchCount * this.penaltyPerMatch);
            }
        });

        return { isValid: true, score: totalPenalty };
    }
}

/**
 * [Strategy 2] 끼니 단위 간격 제약 (Soft)
 * 지정된 끼니 이내 중복 재료 발견 시 감점(-100) 처리합니다.
 */
export class MealIntervalConstraint {
    constructor(ingredientName, minMealInterval) {
        this.ingredientName = ingredientName;
        this.minMealInterval = minMealInterval;
    }

    evaluate(mealSet, context) {
        const { history, currentDate, currentMealIndex, mealsPerDay } = context;
        const hasIngredient = mealSet.items.some(item => 
            item.ingredients && Object.prototype.hasOwnProperty.call(item.ingredients, this.ingredientName)
        );

        if (!hasIngredient) return { isValid: true, score: 0 };

        const currentAbsIdx = this.getAbsoluteIndex(currentDate, currentMealIndex, mealsPerDay);

        for (const record of history) {
            const recordAbsIdx = this.getAbsoluteIndex(record.date, record.mealIndex, mealsPerDay);
            const diff = Math.abs(currentAbsIdx - recordAbsIdx);

            if (diff > 0 && diff <= this.minMealInterval) {
                if (record.ingredients && record.ingredients.has(this.ingredientName)) {
                    return { isValid: true, score: -100 }; // 약한 조건: 감점만 수행
                }
            }
        }
        return { isValid: true, score: 10 };
    }

    getAbsoluteIndex(dateStr, mealIndex, mealsPerDay) {
        const d = new Date(dateStr);
        const dayTimestamp = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        return (Math.floor(dayTimestamp / (1000 * 60 * 60 * 24)) * mealsPerDay) + Number(mealIndex);
    }
}

/**
 * [Strategy 3] 남은 재료 활용 제약 (Soft)
 */
export class LeftoverConstraint {
    evaluate(mealSet, context) {
        const { inventory } = context;
        if (!inventory) return { isValid: true, score: 0 };

        const hasLeftover = mealSet.items.some(item => 
            item.ingredients && Object.keys(item.ingredients).some(ing => inventory[ing] > 0)
        );

        return { isValid: true, score: hasLeftover ? 20 : 0 };
    }
}

/**
 * [Strategy 4] 영양소 균형 제약 (Soft)
 */
export class NutritionConstraint {
    constructor(targetProtein = 30) {
        this.targetProtein = targetProtein;
    }

    evaluate(mealSet) {
        const totalProtein = mealSet.items.reduce((sum, item) => sum + (item.nutrition?.protein || 0), 0);
        return { isValid: true, score: totalProtein >= this.targetProtein ? 15 : 0 };
    }
}