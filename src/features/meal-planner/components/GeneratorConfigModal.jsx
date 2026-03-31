function GeneratorConfigModal({ configs, setConfigs, onClose, onGenerate }) {
    const updateSchedule = (day, val) => {
        setConfigs({
            ...configs,
            schedule: { ...configs.schedule, [day]: parseInt(val) || 0 }
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
                        <h3>자동 생성 옵션</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'stretch', alignItems: 'center', gap: '10px'}}>
                        <label>총 예산</label>
                        <input type="number" style={{flex: 1}} value={configs.budget} onChange={e => setConfigs({...configs, budget: e.target.value})} />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'stretch', alignItems: 'center', gap: '10px'}}>
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