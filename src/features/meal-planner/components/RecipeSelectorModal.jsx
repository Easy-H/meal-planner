import { useState } from 'react';

import { useRecipeSearch } from '../../recipes/hooks/useRecipeSearch';

function RecipeSelectorModal({ foods, currentMeal, onSave, onClose }) {
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

    const handleConfirm = () => {
        if (selectedItems.length === 0) return alert("최소 하나 이상의 메뉴를 선택하세요.");
        onSave(selectedItems);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content recipe-selector card">
                <div className="modal-header">
                    <h2>{currentMeal ? '식단 편집' : '독자적 식단 구성'}</h2>
                </div>

                {/* 현재 선택된 조합 (바구니 역할) */}
                <div className="selected-basket">
                    <div className="section-header">
                        <h3>현재 구성 ({selectedItems.length})</h3>
                    </div>
                    <hr />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {selectedItems.map((it, idx) => (
                            <div key={idx} className="basket-tag"
                                style={{
                                    display: 'flex', flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}>
                                <strong>{it.name}</strong>
                                <button onClick={() => toggleItem(it)}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className='section-header'>
                        <h3>메뉴 검색</h3>
                        <input
                            className="search-input"
                            placeholder=""
                            value={searchTerm}
                            style={{flex: 1, marginLeft: '10px'}}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <hr />
                    <div className="selector-list">
                        {filtered.map((food, idx) => (
                            <div
                                key={idx}
                                className={`selector-item ${selectedItems.find(it => it.id === food.id) ? 'active' : ''}`}
                                onClick={() => toggleItem(food)}
                                style={{
                                    display: 'flex', flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div className="item-info">
                                    <strong>{food.name}</strong>
                                    <span className="cat">({food.category})</span>
                                </div>
                                <div className="item-plus">{selectedItems.find(it => it.id === food.id) ? '✓' : '＋'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>취소</button>
                    <button className="primary-btn" onClick={handleConfirm}>식단 적용하기</button>
                </div>
            </div>
        </div>
    );
}

export default RecipeSelectorModal;