import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

function IngredientFormModal({ ingredient, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        purchasePrice: 0,
        purchaseWeight: 100,
        carbs: 0,
        protein: 0,
        fat: 0
    });

    useEffect(() => {
        if (ingredient) {
            setFormData({
                name: ingredient.name,
                purchasePrice: ingredient.purchasePrice || 0,
                purchaseWeight: ingredient.purchaseWeight || 100,
                carbs: ingredient.carbs || 0,
                protein: ingredient.protein || 0,
                fat: ingredient.fat || 0
            });
        }
    }, [ingredient]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: field === 'name' ? value : Number(value) || 0 }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert("식재료 이름을 입력해주세요.");
        onSave(ingredient?.name, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card">
                <h2>{ingredient ? '식재료 수정' : '식재료 등록'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ width: '100px', fontSize: '0.9rem', fontWeight: '600' }}>식재료명</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            placeholder="예: 삼겹살" 
                            style={{ flex: 1 }}
                        />
                    </div>

                    <div className="purchase-section">
                        <div className="section-header">
                            <h3>구매 정보</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ width: '100px', fontSize: '0.85rem' }}>구매 가격 (₩)</label>
                                <input type="number" value={formData.purchasePrice} onChange={e => handleChange('purchasePrice', e.target.value)} style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ width: '100px', fontSize: '0.85rem' }}>구매 중량 (g)</label>
                                <input type="number" value={formData.purchaseWeight} onChange={e => handleChange('purchaseWeight', e.target.value)} style={{ flex: 1 }} />
                            </div>
                        </div>
                    </div>

                    <div className="nutrition-section">
                        <div className="section-header">
                            <h3>영양 정보 (100g당)</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ width: '100px', fontSize: '0.8rem' }}>탄수화물 (g)</label>
                                <input type="number" value={formData.carbs} onChange={e => handleChange('carbs', e.target.value)} style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ width: '100px', fontSize: '0.8rem' }}>지방 (g)</label>
                                <input type="number" value={formData.fat} onChange={e => handleChange('fat', e.target.value)} style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ width: '100px', fontSize: '0.8rem' }}>단백질 (g)</label>
                                <input type="number" value={formData.protein} onChange={e => handleChange('protein', e.target.value)} style={{ flex: 1 }} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose}>닫기</button>
                        <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={16} /> 저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default IngredientFormModal;