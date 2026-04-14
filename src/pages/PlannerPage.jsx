import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Download, CalendarDays } from 'lucide-react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import { priceService } from '../features/inventory/api/priceService';
import { settingService } from '../common/api/settingService';
import { MealPlanner } from '../features/meal-planner/api/meal-planner';
import { DynamicBudgetConstraint, RepetitionPenaltyStrategy, IngredientIntervalConstraint } from '../features/meal-planner/api/constraint';

import CalendarView from '../features/meal-planner/components/CalendarView';
import RecipeSelectorModal from '../features/meal-planner/components/RecipeSelectorModal';
import GeneratorConfigModal from '../features/meal-planner/components/GeneratorConfigModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function PlannerPage() {
    const [foods, setFoods] = useState([]);
    const [prices, setPrices] = useState({});

    // 요일별 식단 수 설정을 포함한 통합 설정
    const [autoConfigs, setAutoConfigs] = useState({
        budget: 100000,
        avoidRepetition: true,
        minIngredientInterval: 3,
        schedule: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 0: 2 }, // 여기서 관리
        categories: ["주식", "국", "메인반찬", "밑반찬"]
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
                const priceData = prices[n];
                if (priceData && typeof priceData === 'object') {
                    // 새로운 객체 구조 기반 계산: (사용량 / 구매중량) * 구매가격
                    return s + (w / (priceData.purchaseWeight || 100)) * (priceData.purchasePrice || 0);
                }
                // 하위 호환성 (숫자인 경우)
                const price = typeof priceData === 'number' ? priceData : 0;
                return s + (price * w / 100);
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
        if (!startDate || !endDate) return alert("시작일과 종료일을 모두 선택해주세요.");
        const config = {
            startDate, endDate, foods,
            ingredientPrices: prices,
            totalBudget: Number(autoConfigs.budget),
            categories: autoConfigs.categories,
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
        setPlan({ ...newPlan });        setIsConfigOpen(false);
    };

    const handleGetSingleAutoMeal = (currentSelection = []) => {
        if (!selectorConfig) return null;
        const { date, index } = selectorConfig;

        const config = {
            startDate, endDate, foods,
            ingredientPrices: prices,
            totalBudget: Number(autoConfigs.budget),
            categories: autoConfigs.categories,
            schedule: autoConfigs.schedule
        };

        const planner = new MealPlanner(config);
        
        // 제약 조건 추가 (handleAutoFill과 동일)
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

        // 현재까지 짜여진 식단(plan)을 planner 히스토리에 반영
        planner.generate(plan); 

        const excludedNames = currentSelection.map(it => it.name);
        const bestMeal = planner.findBestMeal(date, index, excludedNames);

        if (bestMeal.error) {
            alert(bestMeal.reason);
            return null;
        }
        return bestMeal.items;
    };

    const handleExportExcel = () => {
        if (Object.keys(plan).length === 0) {
            return alert("저장할 식단 데이터가 없습니다.");
        }

        const excelData = [];
        // 날짜순으로 정렬하여 데이터 구성
        const sortedDates = Object.keys(plan).sort();

        sortedDates.forEach(date => {
            const meals = plan[date];
            const row = { "날짜": date };

            // 각 끼니별 메뉴 이름 나열
            meals.forEach((meal, idx) => {
                row[`식단 ${idx + 1}`] = meal ? meal.name : "-";
            });

            // 해당 날짜의 총 영양소 합계 계산
            const dailyNut = meals.reduce((acc, m) => {
                if (m?.nutrition) {
                    acc.carbs += (m.nutrition.carbs || 0);
                    acc.protein += (m.nutrition.protein || 0);
                    acc.fat += (m.nutrition.fat || 0);
                }
                return acc;
            }, { carbs: 0, protein: 0, fat: 0 });

            row["영양 요약(탄/단/지)"] = dailyNut.carbs > 0 
                ? `${dailyNut.carbs}g / ${dailyNut.protein}g / ${dailyNut.fat}g` 
                : "-";

            excelData.push(row);
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "식단표");
        
        // 파일명: 식단표_시작일_종료일.xlsx
        XLSX.writeFile(workbook, `MealPlan_${startDate}_${endDate}.xlsx`);
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
            <div className="card cost-card" style={{ 
                position: 'sticky', top: '10px', zIndex: 1000, 
                padding: '20px', marginBottom: '20px' 
            }}>
                <div className="planner-header-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Row 1: 타이틀 및 날짜 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarDays size={22} color="var(--primary-color)" />
                            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>식단 플래너</h2>
                        </div>
                        
                        <div className="date-picker-group">
                            <CalendarDays size={18} color="var(--primary-color)" />
                            <DatePicker
                                selectsRange={true}
                                startDate={new Date(startDate + 'T00:00:00')}
                                endDate={endDate ? new Date(endDate + 'T00:00:00') : null}
                                onChange={(update) => {
                                    const [start, end] = update;
                                    const formatLocal = (date) => {
                                        if (!date) return null;
                                        const y = date.getFullYear();
                                        const m = String(date.getMonth() + 1).padStart(2, '0');
                                        const d = String(date.getDate()).padStart(2, '0');
                                        return `${y}-${m}-${d}`;
                                    };
                                    if (start) setStartDate(formatLocal(start));
                                    setEndDate(end ? formatLocal(end) : null);
                                }}
                                dateFormat="yyyy-MM-dd"
                                className="modern-datepicker range-picker"
                                placeholderText="날짜 범위를 선택하세요"
                            />
                        </div>
                    </div>
                    
                    {/* Row 2: 보기 설정 및 버튼들 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', }}>
                        <select
                            className="view-dropdown"
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            style={{ minWidth: '140px' }}
                        >
                            <option value="list">📝 리스트형</option>
                            <option value="grid">📱 그리드형</option>
                            <option value="calendar">📅 달력형 (7일)</option>
                        </select>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="secondary-btn" onClick={() => { if (confirm("초기화하시겠습니까?")) setPlan({}); }}>초기화</button>
                            <button className="primary-btn pulse" onClick={handleAutoFill}>자동 채우기</button>
                            <button className="secondary-btn" onClick={handleExportExcel} style={{ backgroundColor: '#2d6a4f', color: 'white' }}>
                                <Download size={16} /> 엑셀
                            </button>
                            <button className="secondary-btn" onClick={() => setIsConfigOpen(true)}>⚙️ 설정</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <CalendarView
                    startDate={startDate}
                    endDate={endDate}
                    viewMode={viewMode}
                    plan={plan}
                    defaultSchedule={autoConfigs.schedule} // 기본 식수 정보 전달
                    onClearSlot={handleClearSlot}
                    onOpenSelector={(date, index) => setSelectorConfig({ date, index })}
                />
            </div>

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
                    onAutoGenerate={handleGetSingleAutoMeal}
                    onClose={() => setSelectorConfig(null)}
                />
            )}
        </>
    );
}

export default PlannerPage;