import React from 'react';

function SettingManager({ settings, onUpdate, constraints, setConstraints }) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <details className="card settings-card">
      <summary><h3>플래너 설정</h3></summary>
      <div className="setting-item">
        <label>카테고리</label>
        <input 
          type="text" 
          value={settings.categories} 
          onChange={(e) => onUpdate({ ...settings, categories: e.target.value })}
          placeholder="주식, 국, 메인반찬"
        />
      </div>

      <div className="setting-item">
        <label>요일별 식사 횟수</label>
        <div className="schedule-grid" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexDirection: 'row'
        }}>
          {days.map((day, i) => (
            <div key={i} className="day-input">
              <span>{day}</span>
              <input 
                type="number" 
                style={{width: '40px'}}
                value={settings.schedule[i]}
                min={0}
                onChange={(e) => onUpdate({
                  ...settings,
                  schedule: { ...settings.schedule, [i]: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="constraint-checks">
        <label>
          <input 
            type="checkbox" 
            checked={constraints.repetition} 
            onChange={e => setConstraints({ ...constraints, repetition: e.target.checked })}
          /> 중복 메뉴 방지
        </label>
      </div>
    </details>
  );
}

export default SettingManager;