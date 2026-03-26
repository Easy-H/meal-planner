import { useState, useEffect } from 'react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import { priceService } from '../features/inventory/api/priceService';
import { settingService } from '../common/api/settingService';
import { MealPlanner } from '../features/meal-planner/api/meal-planner';
import { DynamicBudgetConstraint, RepetitionPenaltyStrategy } from '../features/meal-planner/api/constraint';
import SettingManager from '../features/meal-planner/components/SettingManager';

function PlannerPage() {
    // 1. 외부 주입 데이터 상태
    const [foods, setFoods] = useState([]);
    const [prices, setPrices] = useState({});

    // 2. 설정 관련 상태
    const [settings, setSettings] = useState({ categories: '', schedule: { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3 } });
    const [constraints, setConstraints] = useState({ repetition: true });

    // 3. 입력 필드 및 결과 상태
    const [startDate, setStartDate] = useState('2026-03-24');
    const [endDate, setEndDate] = useState('2026-03-30');
    const [budget, setBudget] = useState(100000);
    const [plan, setPlan] = useState(null);

    // 초기 데이터 주입 (외부 Service 활용)
    useEffect(() => {
        setFoods(recipeService.getRecipes());
        setPrices(priceService.getPrices());
        setSettings(settingService.getSettings());
    }, []);

    const handleGenerate = () => {
        if (foods.length === 0) return alert("등록된 레시피가 없습니다.");

        // MealPlanner 엔진 설정
        const config = {
            startDate,
            endDate,
            foods,
            ingredientPrices: prices,
            totalBudget: Number(budget),
            categories: settings.categories.split(',').map(c => c.trim()),
            schedule: settings.schedule
        };

        const planner = new MealPlanner(config);

        // 제약 조건 주입
        planner.addConstraints(new DynamicBudgetConstraint(Number(budget)));
        if (constraints.repetition) {
            planner.addConstraints(new RepetitionPenaltyStrategy(-1000000));
        }

        const result = planner.generate();
        setPlan(result);
    };

    return (
        <div className="planner-page">
            <div className="planner-layout">
                {/* 왼쪽: 설정 섹션 */}
                <section className="config-side">
                    <div className="card">
                        <h3>기본 일정 및 예산</h3>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'row',

                        }}>
                            <div className="input-group">
                                <label>시작일</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>종료일</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>총 예산</label>
                                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <SettingManager
                        settings={settings}
                        onUpdate={(newSets) => {
                            setSettings(newSets);
                            settingService.saveSettings(newSets); // 설정 변경 시 즉시 저장
                        }}
                        constraints={constraints}
                        setConstraints={setConstraints}
                    />

                    <button className="generate-btn" onClick={handleGenerate}>
                        식단 생성하기
                    </button>
                </section>

                {/* 오른쪽: 결과 출력 섹션 */}
                <section className="result-side">
                    {plan ? (
                        <div className="plan-results">
                            {Object.entries(plan).map(([date, meals]) => (
                                <div key={date} className="day-result card">
                                    <h4>{date}</h4>
                                    {meals.map((meal, idx) => (
                                        <div key={idx} className={`meal-item ${meal.error ? 'error' : ''}`}>
                                            <span className="meal-name">{meal.name}</span>
                                            <span className="meal-cost">₩{meal.totalCost?.toLocaleString()}</span>
                                            {meal.error && <p className="error-text">{meal.reason}</p>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>설정을 확인하고 버튼을 눌러 식단을 생성하세요.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default PlannerPage;