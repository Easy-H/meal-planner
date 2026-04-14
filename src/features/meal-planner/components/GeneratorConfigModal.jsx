function GeneratorConfigModal({ configs, setConfigs, onClose, onGenerate }) {
    const updateSchedule = (day, val) => {
        setConfigs({
            ...configs,
            schedule: { ...configs.schedule, [day]: parseInt(val) || 0 }
        });
    };

    const updateCategories = (val) => {
        setConfigs({
            ...configs,
            categories: val.split(',').map(s => s.trim()).filter(s => s !== '')
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card config-modal">
                <h2>⚙️ 자동 생성 설정</h2>
                
                <div className="config-section">
                    <div className="section-header">
                        <h3>요일별 식수 설정</h3>
                    </div>
                    <div className="day-inputs">
                        {['일','월','화','수','목','금','토'].map((label, idx) => (
                            <div key={idx} className="day-input">
                                <label>{label}</label>
                                <input 
                                    min={0}
                                    value={configs.schedule[idx]} 
                                    onChange={(e) => updateSchedule(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="config-section">
                    <div className="section-header">
                        <h3>스타일 설정</h3>
                    </div>
                    <div className="config-item" style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px'}}>
                        <input type="text" value={configs.categories.join(', ')} onChange={e => updateCategories(e.target.value)} placeholder="예: 주식, 국, 메인반찬, 밑반찬" />
                    </div>

                </div>

                <div className="config-section">
                    <div className="section-header">
                        <h3>제약 조건</h3>
                    </div>
                    <div className="config-item" style={{display: 'flex', justifyContent: 'stretch', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                        <label>총 예산</label>
                        <input type="number" style={{flex: 1}} value={configs.budget} onChange={e => setConfigs({...configs, budget: e.target.value})} />
                    </div>
                    <div className="config-item" style={{display: 'flex', justifyContent: 'stretch', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                        <label title="같은 주재료가 다시 나오기까지의 최소 끼니 수">주재료 간격 (끼니)</label>
                        <input type="number" style={{flex: 1}} value={configs.minIngredientInterval} onChange={e => setConfigs({...configs, minIngredientInterval: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="config-item" style={{display: 'flex', justifyContent: 'stretch', alignItems: 'center', gap: '10px'}}>
                        <label>중복 지양</label>
                        <input type="checkbox" checked={configs.avoidRepetition} onChange={e => setConfigs({...configs, avoidRepetition: e.target.checked})} />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>취소</button>
                    <button className="primary-btn" onClick={onGenerate}>설정 적용 및 생성</button>
                </div>
            </div>
        </div>
    );
}

export default GeneratorConfigModal;