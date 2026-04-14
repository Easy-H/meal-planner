import { useState, useMemo } from 'react';
import MealSlot from './MealSlot';
import NutrientChart from './NutrientChart';

function CalendarView({ startDate, viewMode, endDate, plan, onClearSlot, onOpenSelector }) {

    // 1. 시작일부터 종료일까지의 날짜 배열 생성
    const dateArray = useMemo(() => {
        const dates = [];
        if (!startDate || !endDate) return dates;
        let curr = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        while (curr <= end) {
            const y = curr.getFullYear();
            const m = String(curr.getMonth() + 1).padStart(2, '0');
            const d = String(curr.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    }, [startDate, endDate]);

    // 2. 실제 달력 형태를 위한 빈 칸(Padding) 계산 (첫 날의 요일 기준)
    const calendarPadding = useMemo(() => {
        if (dateArray.length < 1) return [];
        if (viewMode !== 'calendar') return [];
        const firstDate = new Date(dateArray[0]);
        const dayOfWeek = firstDate.getDay(); // 0(일) ~ 6(토)
        return Array(dayOfWeek).fill(null);
    }, [dateArray, viewMode]);

    return (
        <div className="calendar-view-container">
            {/* 상단 뷰 전환 컨트롤바 */}

            {/* 메인 렌더링 영역 */}
            <div className={`planner-display ${viewMode}-view`}>
                {/* 달력형일 때 요일 헤더 표시 */}
                {viewMode === 'calendar' && (
                    ['일', '월', '화', '수', '목', '금', '토'].map(d => (
                        <div key={d} className="calendar-weekday-header">{d}</div>
                    ))
                )}

                {/* 달력형일 때 앞쪽 빈 칸 채우기 */}
                {viewMode === 'calendar' && calendarPadding.map((_, i) => (
                    <div key={`pad-${i}`} className="calendar-day padding"></div>
                ))}

                {/* 실제 날짜들 렌더링 */}
                {dateArray.map(date => {
                    const d = new Date(date + 'T00:00:00');
                    const dayOfWeek = d.getDay();
                    const mealsNeeded = 0;
                    const dailyMeals = plan[date] || Array(mealsNeeded).fill(null);

                    const dailyNutrition = dailyMeals.reduce((acc, m) => {
                        if (m && m.nutrition) {
                            acc.carbs += (m.nutrition.carbs || 0);
                            acc.protein += (m.nutrition.protein || 0);
                            acc.fat += (m.nutrition.fat || 0);
                        }
                        return acc;
                    }, { carbs: 0, protein: 0, fat: 0 });

                    return (
                        <div key={date} className={`calendar-day day-${dayOfWeek}`}>
                            <div className="day-header">
                                <span className="date-num">{d.getDate()}일</span>
                                <span className="day-text">({['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]})</span>
                            </div>
                            <div className="meal-slots">
                                {Array.from({ length: dailyMeals.length }).map((_, idx) => (
                                    <MealSlot
                                        key={`${date}-${idx}`}
                                        meal={dailyMeals[idx]}
                                        onOpenSelector={() => onOpenSelector(date, idx)}
                                        onRemove={() => onClearSlot(date, idx)}
                                    />
                                ))}

                                <MealSlot
                                    meal={null}
                                    onOpenSelector={() => onOpenSelector(date, dailyMeals.length)}

                                />
                            </div>
                            {dailyNutrition.carbs + dailyNutrition.protein + dailyNutrition.fat > 0 && (
                                <NutrientChart nutrition={dailyNutrition} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CalendarView;