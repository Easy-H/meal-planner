import { useState, useMemo } from 'react';
import MealSlot from './MealSlot';

function CalendarView({ startDate, endDate, plan, config, onClearSlot, onOpenSelector }) {
    const [viewMode, setViewMode] = useState('grid'); // 'list' (현재 형태), 'calendar' (실제 달력)

    // 1. 시작일부터 종료일까지의 날짜 배열 생성
    const dateArray = useMemo(() => {
        const dates = [];
        let curr = new Date(startDate);
        const end = new Date(endDate);
        while (curr <= end) {
            dates.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    }, [startDate, endDate]);

    // 2. 실제 달력 형태를 위한 빈 칸(Padding) 계산 (첫 날의 요일 기준)
    const calendarPadding = useMemo(() => {
        if (viewMode !== 'calendar') return [];
        const firstDate = new Date(dateArray[0]);
        const dayOfWeek = firstDate.getDay(); // 0(일) ~ 6(토)
        return Array(dayOfWeek).fill(null);
    }, [dateArray, viewMode]);

    return (
        <div className="calendar-view-container">
            {/* 상단 뷰 전환 컨트롤바 */}
            <div className="view-switcher card">
                <button 
                    className={viewMode === 'list' ? 'active' : ''} 
                    onClick={() => setViewMode('list')}
                >📝 리스트형</button>
                <button 
                    className={viewMode === 'grid' ? 'active' : ''} 
                    onClick={() => setViewMode('grid')}
                >📱 그리드형</button>
                <button 
                    className={viewMode === 'calendar' ? 'active' : ''} 
                    onClick={() => setViewMode('calendar')}
                >📅 달력형 (7일)</button>
            </div>

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
                    const d = new Date(date);
                    const dayOfWeek = d.getDay();
                    const mealsNeeded = config.schedule[dayOfWeek] || 0;
                    const dailyMeals = plan[date] || Array(mealsNeeded).fill(null);

                    return (
                        <div key={date} className={`calendar-day day-${dayOfWeek}`}>
                            <div className="day-header">
                                <span className="date-num">{d.getDate()}일</span>
                                <span className="day-text">({['일','월','화','수','목','금','토'][dayOfWeek]})</span>
                            </div>
                            <div className="meal-slots">
                                {Array.from({ length: mealsNeeded }).map((_, idx) => (
                                    <MealSlot 
                                        key={`${date}-${idx}`}
                                        meal={dailyMeals[idx]}
                                        onOpenSelector={() => onOpenSelector(date, idx)}
                                        onClearSlot={() => onClearSlot(date, idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CalendarView;