import { useState, useEffect, useMemo } from 'react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import { priceService } from '../features/inventory/api/priceService';
import { Database, Plus, Search, Save, Trash2, Edit2 } from 'lucide-react';
import * as Hangul from 'hangul-js';
import IngredientFormModal from '../features/inventory/components/IngredientFormModal';

function InventoryPage() {
  const [prices, setPrices] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  useEffect(() => {
    setPrices(priceService.getPrices());
  }, []);

  // 가격 정보가 있는 모든 재료 리스트
  const allIngredients = useMemo(() => Object.keys(prices).sort(), [prices]);

  const handleSaveIngredient = (oldName, data) => {
    const { name, ...details } = data;
    
    setPrices(prev => {
      const next = { ...prev };
      // 이름을 변경한 경우 이전 키 삭제
      if (oldName && oldName !== name) {
        delete next[oldName];
      }
      next[name] = details;
      return next;
    });
    
    setIsModalOpen(false);
    setEditingIngredient(null);
  };

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleDeleteIngredient = (name) => {
    if (window.confirm(`'${name}' 식재료를 삭제하시겠습니까?`)) {
      setPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[name];
        return newPrices;
      });
    }
  };

  const openEditModal = (name) => {
    setEditingIngredient({ name, ...prices[name] });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    priceService.savePrices(prices);
    alert("식재료 사전이 업데이트되었습니다.");
  };

  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return allIngredients;
    return allIngredients.filter(ing => 
      Hangul.search(ing, searchTerm) >= 0
    );
  }, [allIngredients, searchTerm]);

  return (
    <div className="page-container">
      <div className="card toolbar-card" style={{ marginBottom: '20px' }}>
        <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
            <Database size={20} color="var(--primary-color)" />
            <h3 style={{ whiteSpace: 'nowrap' }}>식재료 사전</h3>
          </div>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="재료 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px' }}
            />
          </div>
          <button className="secondary-btn" onClick={handleAddIngredient} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Plus size={16} /> 신규 재료
          </button>
          <button className="primary-btn" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Save size={16} /> 저장
          </button>
        </div>
      </div>

      <div className="card table-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ maxHeight: '60vh', border: 'none' }}>
          <table className="cost-table">
            <thead>
              <tr>
                <th className="sticky-col" style={{ width: '200px', minWidth: '200px' }}>식재료명</th>
                <th style={{ width: '120px' }}>구매가 (₩)</th>
                <th style={{ width: '100px' }}>중량 (g)</th>
                <th style={{ width: '100px' }}>탄수 (100g)</th>
                <th style={{ width: '100px' }}>단백 (100g)</th>
                <th style={{ width: '100px' }}>지방 (100g)</th>
                <th className="sticky-col-right" style={{ width: '100px', minWidth: '100px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map(ing => (
                <tr key={ing}>
                  <td className="sticky-col font-semibold" style={{ textAlign: 'left', paddingLeft: '20px' }}>
                    {ing}
                  </td>
                  <td style={{ textAlign: 'right' }}>₩{(prices[ing]?.purchasePrice || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{(prices[ing]?.purchaseWeight || 0).toLocaleString()}g</td>
                  <td style={{ textAlign: 'center' }}>{prices[ing]?.carbs || 0}g</td>
                  <td style={{ textAlign: 'center' }}>{prices[ing]?.protein || 0}g</td>
                  <td style={{ textAlign: 'center' }}>{prices[ing]?.fat || 0}g</td>
                  <td className="sticky-col-right">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button 
                        style={{ color: 'var(--primary-color)', background: 'none', cursor: 'pointer', padding: '4px' }} 
                        onClick={() => openEditModal(ing)}
                        title="수정"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="del-text" 
                        onClick={() => handleDeleteIngredient(ing)} 
                        style={{ color: '#ff5252', background: 'none', cursor: 'pointer', padding: '4px' }}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <IngredientFormModal 
          ingredient={editingIngredient}
          onSave={handleSaveIngredient}
          onClose={() => { setIsModalOpen(false); setEditingIngredient(null); }}
        />
      )}
    </div>
  );
}
export default InventoryPage;