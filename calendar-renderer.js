export class CalendarRenderer {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
    }

    render(planData) {
        const dates = Object.keys(planData).sort();
        if (dates.length === 0) return;

        const firstDate = new Date(dates[0]);
        const startDay = firstDate.getDay(); // 0(일) ~ 6(토)

        // 1. 달력 데이터를 주(Week) 단위 2차원 배열로 재구성
        let calendar = [[]];
        let weekIdx = 0;
        let maxMeals = 0;

        // 시작일 전 빈칸 채우기
        for (let i = 0; i < startDay; i++) {
            calendar[weekIdx].push({ date: null, meals: [] });
        }

        dates.forEach(dateStr => {
            if (calendar[weekIdx].length === 7) {
                calendar.push([]);
                weekIdx++;
            }
            const meals = planData[dateStr] || [];
            calendar[weekIdx].push({
                date: new Date(dateStr).getDate(),
                meals: meals
            });
            if (meals.length > maxMeals) maxMeals = meals.length;
        });

        // 마지막 주 빈칸 채우기
        while (calendar[weekIdx].length < 7) {
            calendar[weekIdx].push({ date: null, meals: [] });
        }

        // 2. HTML 생성 (행 중심 구조)
        let html = `
            <table class="grid-calendar">
                <colgroup>
                    <col style="width: 50px;"> <col span="7"> </colgroup>
                <thead>
                    <tr>
                        <th class="label-col">구분</th>
                        <th class="sun">일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th class="sat">토</th>
                    </tr>
                </thead>
                <tbody>
        `;

        console.log(planData);
        console.log(calendar);

        calendar.forEach(week => {
            // A. 날짜 행 (Row 1)
            html += `<tr class="date-row"><td class="row-label">날짜</td>`;
            week.forEach(day => {
                html += `<td class="date-cell">${day.date || ''}</td>`;
            });
            html += `</tr>`;

            // B. 식단 차수별 행 (Row 2 ~ maxMeals+1)
            for (let mIdx = 0; mIdx < maxMeals; mIdx++) {
                html += `<tr class="meal-row">`;
                html += `<td class="row-label">${mIdx + 1}차</td>`; // 맨 왼쪽에만 차수 표시

                week.forEach(day => {
                    const meal = day.meals[mIdx];
                    if (meal && !meal.error && meal.items) {
                        const names = meal.items.map(it => it.name).join('<br>');
                        html += `
                            <td class="meal-cell ${meal.isFixed ? 'fixed' : ''}">
                                ${names}
                            </td>`;
                    } else {
                        html += `<td class="meal-cell empty">-</td>`;
                    }
                });
                html += `</tr>`;
            }
        });

        html += `</tbody></table>`;
        this.container.innerHTML = html;
    }
}