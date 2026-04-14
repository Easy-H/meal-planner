import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, BarChart3, Plus } from 'lucide-react';
import { priceService } from '../features/inventory/api/priceService';
import NutrientChart from '../features/meal-planner/components/NutrientChart';
import DatePicker from 'react-datepicker';

function AnalysisPage() {
    const [plan, setPlan] = useState({});
    const [prices, setPrices] = useState({});
    const [startDate, setStartDate] = useState('2026-03-24');
    const [endDate, setEndDate] = useState('2026-03-30');

    useEffect(() => {
        const savedPlan = localStorage.getItem('mp_current_plan');
        if (savedPlan) setPlan(JSON.parse(savedPlan));
        setPrices(priceService.getPrices());
    }, []);

    const mealAnalysis = useMemo(() => {
        const summary = {};
        let totalCost = 0;
        const totalNutrition = { carbs: 0, protein: 0, fat: 0 };

        Object.entries(plan).forEach(([date, meals]) => {
            if (date >= startDate && date <= endDate) {
                meals.forEach(meal => {
                    if (meal?.items) {
                        meal.items.forEach(item => {
                            Object.entries(item.ingredients || {}).forEach(([name, weight]) => {
                                const rawData = prices[name];
                                // 레시피에는 있지만 사전에는 없는 경우 혹은 기존 숫자 데이터를 위한 방어 코드
                                const ingData = (rawData && typeof rawData === 'object')
                                    ? rawData
                                    : { purchasePrice: typeof rawData === 'number' ? rawData : 0, purchaseWeight: 100, carbs: 0, protein: 0, fat: 0 };

                                if (!summary[name]) summary[name] = { weight: 0, price: ingData.purchasePrice ?? 0, pWeight: ingData.purchaseWeight ?? 100 };
                                
                                summary[name].weight += weight;
                                
                                // 비용 계산: (사용량 / 구매중량) * 구매가격
                                totalCost += (weight / (ingData.purchaseWeight || 100)) * (ingData.purchasePrice || 0);
                                
                                // 영양소 계산 (식재료 사전 기반): (사용량 / 100g) * 100g당 영양성분
                                totalNutrition.carbs += (weight / 100) * (ingData.carbs || 0);
                                totalNutrition.protein += (weight / 100) * (ingData.protein || 0);
                                totalNutrition.fat += (weight / 100) * (ingData.fat || 0);
                            });
                        });
                    }
                });
            }
        });
        return { details: Object.entries(summary), totalCost, totalNutrition };
    }, [plan, startDate, endDate, prices]);

    const handleUpdatePrice = (name, newPrice) => {
        const updatedPrices = { ...prices, [name]: Number(newPrice) };
        setPrices(updatedPrices);
        priceService.savePrices(updatedPrices);
    };

    return (
        <div className="page-container">
            <div className="card" style={{ marginBottom: '15px' }}>
                <div className="analysis-summary-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="date-picker-group" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart3 size={20} color="var(--primary-color)" />
                        <h3 style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>분석 리포트</h3>
                        <CalendarDays size={18} color="var(--primary-color)" />
                        <DatePicker
                            selectsRange={true}
                            startDate={new Date(startDate + 'T00:00:00')}
                            endDate={endDate ? new Date(endDate + 'T00:00:00') : null}
                            onChange={(update) => {
                                const [start, end] = update;
                                const formatLocal = (d) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;
                                if (start) setStartDate(formatLocal(start));
                                if (end) setEndDate(formatLocal(end));
                            }}
                            dateFormat="yyyy-MM-dd"
                            className="modern-datepicker range-picker"
                        />
                    </div>
                    <div className="summary-stats" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                        <div className="stat-item" style={{ textAlign: 'right' }}>
                            <span className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>총 예상 지출</span>
                            <span className="value" style={{ fontSize: '1.6rem', color: 'var(--primary-color)', fontWeight: '800' }}>
                                ₩{Math.floor(mealAnalysis.totalCost).toLocaleString()}
                            </span>
                        </div>
                        <div className="stat-item nutrition-summary-box" style={{ width: '200px', borderLeft: '2px solid var(--border-light)', paddingLeft: '40px' }}>
                            <span className="label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center', display: 'block' }}>영양 균형 요약</span>
                            <NutrientChart nutrition={mealAnalysis.totalNutrition} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="content-toolbar">
                    <h3 style={{ fontSize: '1rem' }}>📦 상세 식재료 소요량 ({mealAnalysis.details.length})</h3>
                </div>
                <div className="table-container" style={{maxHeight: 'none'}}>
                    <table className="cost-table">
                        <thead>
                            <tr>
                                <th className="sticky-col" style={{ width: '180px', minWidth: '180px' }}>재료명</th>
                                <th>필요량</th>
                                <th>구매 정보 (단가/중량)</th>
                                <th className="sticky-col-right" style={{ width: '120px', minWidth: '120px' }}>소계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mealAnalysis.details.map(([name, info]) => (
                                <tr key={name}>
                                    <td className="sticky-col font-semibold">{name}</td>
                                    <td>{info.weight >= 1000 ? `${(info.weight/1000).toFixed(1)}kg` : `${Math.round(info.weight)}g`}</td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem' }}>
                                            ₩{(info.price ?? 0).toLocaleString()} / {info.pWeight}g
                                        </span>
                                    </td>
                                    <td className="sticky-col-right text-right font-bold">
                                        ₩{Math.floor((info.weight / (info.pWeight || 100)) * (info.price ?? 0)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
export default AnalysisPage;