import { useState, useEffect } from 'react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import { priceService } from '../features/inventory/api/priceService';
import { settingService } from '../common/api/settingService';
import { MealPlanner } from '../features/meal-planner/api/meal-planner';
import { DynamicBudgetConstraint, RepetitionPenaltyStrategy, IngredientIntervalConstraint } from '../features/meal-planner/api/constraint';

import CalendarView from '../features/meal-planner/components/CalendarView';
import RecipeSelectorModal from '../features/meal-planner/components/RecipeSelectorModal';
import GeneratorConfigModal from '../features/meal-planner/components/GeneratorConfigModal';

function PlannerPage() {
    const [foods, setFoods] = useState([]);
    const [prices, setPrices] = useState({});
    const [settings, setSettings] = useState({ categories: '', schedule: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 0: 2 } });

    const [plan, setPlan] = useState(() => {
        const saved = localStorage.getItem('mp_current_plan');
        return saved ? JSON.parse(saved) : {};
    });

    const [startDate, setStartDate] = useState('2026-03-24');
    const [endDate, setEndDate] = useState('2026-03-30');

    // --- 모달 제어 상태 ---
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [selectorConfig, setSelectorConfig] = useState(null);

    // --- 통합 자동 생성 설정 (예산 포함) ---
    const [autoConfigs, setAutoConfigs] = useState({
        budget: 100000,
        avoidRepetition: true,
        minIngredientInterval: 3
    });

    useEffect(() => {
        setFoods(recipeService.getRecipes());
        setPrices(priceService.getPrices());
        const savedSettings = settingService.getSettings();
        if (savedSettings) setSettings(savedSettings);
    }, []);

    useEffect(() => {
        localStorage.setItem('mp_current_plan', JSON.stringify(plan));
    }, [plan]);

    // RecipeSelectorModal에서 넘어온 아이템 배열로 식단을 생성/수정하는 함수
    const handleSaveManualMeal = (selectedItems) => {
        if (!selectorConfig) return;
        const { date, index } = selectorConfig;

        const totalCost = selectedItems.reduce((sum, item) => {
            return sum + Object.entries(item.ingredients || {}).reduce((s, [n, w]) => {
                return s + ((prices[n] || 0) * w / 100);
            }, 0);
        }, 0);

        const newPlan = { ...plan };
        if (!newPlan[date]) {
            const needed = settings.schedule[new Date(date).getDay()] || 0;
            newPlan[date] = Array(needed).fill(null);
        }

        newPlan[date][index] = {
            name: selectedItems.map(it => it.name).join(' + '),
            items: selectedItems,
            totalCost: totalCost,
            allIngredients: new Set(selectedItems.flatMap(it => Object.keys(it.ingredients || {}))),
            isFixed: true // 사람이 직접 만든 것은 자동 채우기가 건드리지 못하게 함
        };

        setPlan(newPlan);
        setSelectorConfig(null);
    };

    const handleAutoFill = () => {
        const config = {
            startDate, endDate, foods,
            ingredientPrices: prices,
            totalBudget: Number(autoConfigs.budget),
            categories: settings.categories.split(',').map(c => c.trim()),
            schedule: settings.schedule
        };

        const planner = new MealPlanner(config);
        planner.addConstraints(new DynamicBudgetConstraint(Number(autoConfigs.budget)));

        if (autoConfigs.avoidRepetition) {
            planner.addConstraints(new RepetitionPenaltyStrategy(-5000));
        }

        if (autoConfigs.minIngredientInterval > 0) {
            const mainIngredients = ["돼지고기", "소고기", "닭고기", "생선"];
            mainIngredients.forEach(ing => {
                planner.addConstraints(new IngredientIntervalConstraint(ing, autoConfigs.minIngredientInterval));
            });
        }

        const newPlan = planner.generate(plan);
        setPlan({ ...newPlan });
        setIsConfigOpen(false); // 생성 후 모달 닫기
    };

    const handleClearSlot = (date, index) => {
        const newPlan = { ...plan };
        if (newPlan[date]) {
            newPlan[date][index] = null;
            setPlan(newPlan);
        }
    };

    const getMeal = () => {
        if (!plan) {
            return null;
        }
        if (!selectorConfig) {
            return null;
        }
        const dayPlan = plan[selectorConfig.date];
        if (!dayPlan) {
            return null;
        }
        return dayPlan[selectorConfig.index];
    }

    const currentMeal = getMeal();

    return (
        <>
            <header className="planner-toolbar card">
                <div className="date-picker-row">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>~</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </header>

            <div className="card" style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center' }}>
                <button className="secondary-btn" onClick={() => setIsConfigOpen(true)}>생성 설정</button>
                <button className="primary-btn pulse" onClick={handleAutoFill}>자동 채우기</button>
                <button className="outline-btn" onClick={() => { if (confirm("초기화?")) setPlan({}); }}>초기화</button>
            </div>

            <CalendarView
                startDate={startDate}
                endDate={endDate}
                plan={plan}
                config={settings}
                onClearSlot={handleClearSlot}
                onOpenSelector={(date, index) => setSelectorConfig({ date, index })}
            />

            {/* 생성 설정 모달 */}
            {isConfigOpen && (
                <GeneratorConfigModal
                    configs={autoConfigs}
                    setConfigs={setAutoConfigs}
                    onClose={() => setIsConfigOpen(false)}
                    onGenerate={handleAutoFill}
                />
            )}

            {/* 레시피 선택 모달 */}
            {selectorConfig && (
                <RecipeSelectorModal
                    foods={foods}
                    currentMeal={currentMeal}
                    onSave={(recipe) => {
                        /* handleSelectRecipe 로직 그대로 사용 */
                        handleSaveManualMeal(recipe);
                        setSelectorConfig(null);
                    }}
                    onClose={() => setSelectorConfig(null)}
                />
            )}
        </>
    );
}

export default PlannerPage;