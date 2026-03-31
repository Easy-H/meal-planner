import { useState } from 'react';
import { useRecipeSearch } from '../hooks/useRecipeSearch';

function RecipeManager({ foods, onEdit, onDelete, onAdd }) {
    // 1. 검색어 상태 관리
    const [searchTerm, setSearchTerm] = useState('');
    const { searchResult } = useRecipeSearch(foods, searchTerm);
    // 2. 검색어에 따른 필터링 로직
    // 이름, 카테고리, 혹은 포함된 재료 명칭으로 검색 가능
    const filteredFoods = searchResult/*foods.filter((food) => {
        const target = searchTerm.toLowerCase();
        return (
            food.name.toLowerCase().includes(target) ||
            food.category.toLowerCase().includes(target) ||
            Object.keys(food.ingredients || {}).some(ing => ing.toLowerCase().includes(target))
        );
    });*/

    return (
        <>
            <header>
                <div className="page-header" style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'stretch', 
                    gap: '12px',
                }}>
                    {/* 검색창: value와 onChange 연결 */}
                    <input 
                        type="text" 
                        placeholder="요리명, 카테고리 또는 재료 검색..." 
                        style={{ flex: 3, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        className="primary-btn" 
                        onClick={()=>{onAdd(searchTerm)}} // 부모의 모달 오픈 함수 호출
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        + 새 레시피 등록
                    </button>
                </div>
            </header>

            <div className="recipe-grid">
                {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                        <div key={food.id} className="recipe-item-card" onClick={() => onEdit(food)}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '8px' }}>
                                <div className="recipe-info">
                                    <strong style={{ fontSize: '1.1rem' }}>{food.name}</strong>
                                    <span className="badge" style={{ marginLeft: '8px', color: '#666' }}>
                                        ({food.category})
                                    </span>
                                </div>
                                <div className="recipe-details">
                                    <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
                                        {Object.keys(food.ingredients || {}).join(', ')}
                                    </p>
                                </div>
                            </div>
                            <div className="recipe-actions" style={{ display: 'flex', gap: '8px'}}>
                                <button className="del-text" onClick={() => onDelete(food.id)} style={{ color: 'red' }}>삭제</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-search" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </>
    );
}

export default RecipeManager;