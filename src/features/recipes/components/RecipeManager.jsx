import { useState } from 'react';
import { useRecipeSearch } from '../hooks/useRecipeSearch';
import { ChefHat, Plus, Search, Trash2, Edit2 } from 'lucide-react';

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
            <div className="card toolbar-card" style={{ marginBottom: '20px' }}>
                <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
                    <ChefHat size={20} color="var(--primary-color)" />
                    <h3 style={{ whiteSpace: 'nowrap' }}>레시피 사전</h3>
                </div>
                <div style={{ position: 'relative', flex: '1 1 250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="요리명, 카테고리 또는 재료 검색..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px' }}
                    />
                </div>
                <button className="primary-btn" onClick={() => onAdd(searchTerm)} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> 새 레시피 등록
                </button>
            </div>
            </div>

            <div className="card table-card" style={{ overflow: 'hidden' }}>
                <div className="table-container" style={{ maxHeight: '65vh', border: 'none' }}>
                <table className="cost-table">
                    <thead>
                        <tr>
                            <th className="sticky-col" style={{ width: '200px', minWidth: '200px' }}>요리명</th>
                            <th style={{ width: '120px' }}>카테고리</th>
                            <th style={{ width: '150px' }}>스타일</th>
                            <th>포함 재료</th>
                            <th className="sticky-col-right" style={{ width: '100px', minWidth: '100px' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFoods.length > 0 ? (
                            filteredFoods.map((food) => (
                                <tr key={food.id}>
                                    <td className="sticky-col font-semibold" style={{ textAlign: 'left', paddingLeft: '20px' }}>
                                        {food.name}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge" style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                            {food.category}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                            {food.style && food.style.map((s, i) => (
                                                <span key={i} style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--primary-color)', whiteSpace: 'nowrap' }}>
                                                    #{s}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.9rem', color: '#666' }}>
                                        {Object.keys(food.ingredients || {}).join(', ')}
                                    </td>
                                    <td className="sticky-col-right">
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                            <button 
                                                style={{ color: 'var(--primary-color)', background: 'none', cursor: 'pointer', padding: '4px' }} 
                                                onClick={() => onEdit(food)}
                                                title="수정"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="del-text" 
                                                onClick={(e) => { e.stopPropagation(); onDelete(food.id); }} 
                                                style={{ color: '#ff5252', background: 'none', cursor: 'pointer', padding: '4px' }}
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </>
    );
}

export default RecipeManager;