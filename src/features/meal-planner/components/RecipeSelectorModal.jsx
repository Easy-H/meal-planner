import { useState } from 'react';

import { useRecipeSearch } from '../../recipes/hooks/useRecipeSearch';

function RecipeSelectorModal({ foods, currentMeal, onSave, onClose, onAutoGenerate }) {
    const [searchTerm, setSearchTerm] = useState('');
    // 현재 편집 중인 식단의 아이템들 (직접 조합용)
    const [selectedItems, setSelectedItems] = useState(currentMeal?.items || []);

    const { searchResult } = useRecipeSearch(foods, searchTerm);
    // 2. 검색어에 따른 필터링 로직
    // 이름, 카테고리, 혹은 포함된 재료 명칭으로 검색 가능
    const filtered = searchResult

    const toggleItem = (food) => {
        const exists = selectedItems.find(it => it.id === food.id);
        if (exists) {
            setSelectedItems(selectedItems.filter(it => it.id !== food.id));
        } else {
            setSelectedItems([...selectedItems, food]);
        }
    };

    const handleAutoPick = () => {
        const autoItems = onAutoGenerate(selectedItems);
        if (autoItems) {
            setSelectedItems(autoItems);
        }
    };

    const handleConfirm = () => {
        if (selectedItems.length === 0) return alert("최소 하나 이상의 메뉴를 선택하세요.");
        onSave(selectedItems);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content recipe-selector card">
                <h2>{currentMeal ? '식단 수정하기' : '새로운 식단 구성'}</h2>

                {/* 현재 선택된 조합 (바구니 역할) */}
                <div className="selected-basket">
                    <div className="section-header">
                        <h3>선택된 메뉴 ({selectedItems.length})</h3>
                    </div>
                    <div className="basket-content" 
                        style={{ 
                            display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '15px', 
                            background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', 
                            border: '1px solid var(--border-light)', minHeight: '80px', marginBottom: '10px' 
                        }}>
                        {selectedItems.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 'auto' }}>식단에 담을 메뉴를 아래에서 선택하세요.</p>
                        ) : (
                            selectedItems.map((it, idx) => (
                                <div key={it.id || idx} className="basket-tag"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        background: 'white', padding: '8px 14px', borderRadius: '24px',
                                        boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0'
                                    }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{it.name}</span>
                                    <button onClick={() => toggleItem(it)} style={{ background: 'none', padding: 0, color: '#ff5252', border: 'none', cursor: 'pointer', fontSize: '16px', marginLeft: '6px' }}>✕</button>
                                </div>
                            )))}
                    </div>
                </div>

                <div className="selector-search-section">
                    <div className="section-header">
                        <h3>메뉴 검색</h3>
                        <button className="secondary-btn" onClick={handleAutoPick} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                            ✨ 자동 생성
                        </button>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            placeholder="메뉴 이름이나 식재료 검색"
                            value={searchTerm}
                            style={{ width: '100%' }}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="selector-list" style={{ padding: '4px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}>
                        {filtered.map((food, idx) => (
                            <div
                                key={idx}
                                className={`selector-item ${selectedItems.find(it => it.id === food.id) ? 'active' : ''}`}
                                onClick={() => toggleItem(food)}
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: 'var(--radius-md)', marginBottom: '10px',
                                    background: selectedItems.find(it => it.id === food.id) ? '#f0fdf4' : 'white',
                                    border: selectedItems.find(it => it.id === food.id) ? '2px solid var(--primary-color)' : '1px solid var(--border-light)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div className="item-info">
                                    <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{food.name}</strong>
                                    <span className="cat" style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>{food.category}</span>
                                </div>
                                <div className="item-plus" style={{ color: selectedItems.find(it => it.id === food.id) ? 'var(--primary-color)' : '#cbd5e1', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {selectedItems.find(it => it.id === food.id) ? '✓ 완료' : '＋ 담기'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose} style={{ flex: 1 }}>취소</button>
                    <button className="primary-btn" onClick={handleConfirm} style={{ flex: 1 }}>식단 적용하기</button>
                </div>
            </div>
        </div>
    );
}

export default RecipeSelectorModal;