function GeneratorConfigModal({ configs, setConfigs, onClose, onGenerate }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content card config-modal">
                <div className="modal-header">
                    <h2>자동 생성 옵션</h2>
                </div>

                <div>
                    <div className="section-header">
                        <h3>총 예산</h3>
                        <input
                            type="number"
                            value={configs.budget}
                            onChange={e => setConfigs({ ...configs, budget: e.target.value })}
                        />
                    </div>
                </div>

                <div className="section-header">
                    <h3>주요 재료 최소 간격</h3>
                    <div className="range-input">
                        <input
                            type="number" min="0" max="10"
                            value={configs.minIngredientInterval}
                            onChange={e => setConfigs({ ...configs, minIngredientInterval: e.target.value })}
                        />
                    </div>

                </div>
                <div>
                    <div>
                        <h3>
                            <input
                                type="checkbox"
                                checked={configs.avoidRepetition}
                                onChange={e => setConfigs({ ...configs, avoidRepetition: e.target.checked })}
                            />
                            동일 메뉴 중복 기피
                        </h3>
                    </div>
                </div>
                <div>
                </div>
                <div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>취소</button>
                    <button className="primary-btn" onClick={onGenerate}>이 설정으로 생성하기</button>
                </div>
            </div>
        </div>
    );
}

export default GeneratorConfigModal;