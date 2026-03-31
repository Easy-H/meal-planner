import { useState, useEffect } from 'react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import { priceService } from '../features/inventory/api/priceService';
import { settingService } from '../common/api/settingService';
import { MealPlanner } from '../features/meal-planner/api/meal-planner';
import { DynamicBudgetConstraint, RepetitionPenaltyStrategy, IngredientIntervalConstraint } from '../features/meal-planner/api/constraint';

import CalendarView from '../features/meal-planner/components/CalendarView';
import RecipeSelectorModal from '../features/meal-planner/components/RecipeSelectorModal';
import GeneratorConfigModal from '../features/meal-planner/components/GeneratorConfigModal';
import DatePicker from 'react-datepicker';

function PlannerPage() {
    const [foods, setFoods] = useState([]);
    const [prices, setPrices] = useState({});

    // 요일별 식단 수 설정을 포함한 통합 설정
    const [autoConfigs, setAutoConfigs] = useState({
        budget: 100000,
        avoidRepetition: true,
        minIngredientInterval: 3,
        schedule: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 0: 2 } // 여기서 관리
    });

    const [plan, setPlan] = useState(() => {
        const saved = localStorage.getItem('mp_current_plan');
        return saved ? JSON.parse(saved) : {};
    });

    const [startDate, setStartDate] = useState('2026-03-24');
    const [endDate, setEndDate] = useState('2026-03-30');

    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [selectorConfig, setSelectorConfig] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'list' (현재 형태), 'calendar' (실제 달력)

    useEffect(() => {
        setFoods(recipeService.getRecipes());
        setPrices(priceService.getPrices());
        const savedSettings = settingService.getSettings();
        if (savedSettings) {
            setAutoConfigs(prev => ({ ...prev, schedule: savedSettings.schedule }));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('mp_current_plan', JSON.stringify(plan));
    }, [plan]);

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
            const dayOfWeek = new Date(date).getDay();
            const needed = 0;
            newPlan[date] = Array(needed).fill(null);
        }

        newPlan[date][index] = {
            name: selectedItems.map(it => it.name).join(' + '),
            items: selectedItems,
            totalCost: totalCost,
            allIngredients: Array.from(new Set(selectedItems.flatMap(it => Object.keys(it.ingredients || {})))),
            isFixed: true
        };

        setPlan(newPlan);
        setSelectorConfig(null);
    };

    const handleAutoFill = () => {
        const config = {
            startDate, endDate, foods,
            ingredientPrices: prices,
            totalBudget: Number(autoConfigs.budget),
            categories: ["주식", "국", "메인반찬", "밑반찬"], // 필요시 설정에서 가져옴
            schedule: autoConfigs.schedule
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
        setIsConfigOpen(false);
    };
    const handleClearSlot = (date, index) => {
        const newPlan = { ...plan };

        if (newPlan[date]) {
            // 해당 인덱스만 제외하고 새로운 배열을 생성합니다.
            const updatedDayPlan = newPlan[date].filter((_, i) => i !== index);

            // 만약 해당 날짜에 식단이 하나도 남지 않는다면 키 자체를 삭제하거나 빈 배열로 둡니다.
            if (updatedDayPlan.length === 0) {
                delete newPlan[date];
            } else {
                newPlan[date] = updatedDayPlan;
            }

            setPlan(newPlan);
        }
    };

    const currentMeal = selectorConfig ? plan[selectorConfig.date]?.[selectorConfig.index] : null;

    return (
        <>
            <header style={{
                    display: 'flex', flexDirection: 'column',
                    gap: '10px', position: 'sticky', top: 0,
                    zIndex: 1000, backgroundColor: 'white',
                    padding: '10px'
                }}>
                <div className="planner-toolbar"
                style={{
                    display: 'flex', flexDirection: 'row',
                    justifyContent: 'space-between', flexWrap: 'wrap',
                    gap: '10px'
                }}>
                <div className="date-picker-row">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>~</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

                </div>
                <select
                    id="view-mode-select"
                    className="view-dropdown"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                >
                    <option value="list">📝 리스트형</option>
                    <option value="grid">📱 그리드형</option>
                    <option value="calendar">📅 달력형 (7일)</option>
                </select>
            </div>
            <div style={{
                display: 'flex', flexDirection: 'row',
                justifyContent: 'space-between', flexWrap: 'wrap',
                gap: '10px', flex: 1
            }}>
                <button className="secondary-btn" onClick={() => { if (confirm("초기화하시겠습니까?")) setPlan({}); }}
                    style={{ flex: 1 }}>초기화</button>
                <button className="primary-btn pulse" onClick={handleAutoFill}
                    style={{ flex: 1 }}>자동 채우기</button>
                <button className="secondary-btn" onClick={() => setIsConfigOpen(true)}>⚙️</button>

            </div>
            </header>

            <CalendarView
                startDate={startDate}
                endDate={endDate}
                viewMode={viewMode}
                plan={plan}
                defaultSchedule={autoConfigs.schedule} // 기본 식수 정보 전달
                onClearSlot={handleClearSlot}
                onOpenSelector={(date, index) => setSelectorConfig({ date, index })}
            />

            {isConfigOpen && (
                <GeneratorConfigModal
                    configs={autoConfigs}
                    setConfigs={setAutoConfigs}
                    onClose={() => setIsConfigOpen(false)}
                    onGenerate={handleAutoFill}
                />
            )}

            {selectorConfig && (
                <RecipeSelectorModal
                    foods={foods}
                    currentMeal={currentMeal}
                    onSave={handleSaveManualMeal}
                    onClose={() => setSelectorConfig(null)}
                />
            )}
        </>
    );
}

export default PlannerPage;