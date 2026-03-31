import { useState, useEffect } from 'react';

function RecipeFormModal({ recipe, initialName, onSave, onClose }) {
    const [name, setName] = useState(initialName);
    const [category, setCategory] = useState('주식');
    // style을 배열로 관리합니다.
    const [styleList, setStyleList] = useState(['기타']);
    const [ingredientList, setIngredientList] = useState([{ name: '', weight: '' }]);

    useEffect(() => {
        if (recipe) {
            setName(recipe.name);
            setCategory(recipe.category);
            // 기존 레시피의 style 배열을 불러옵니다. 없으면 기본값 부여
            setStyleList(recipe.style && recipe.style.length > 0 ? recipe.style : ['기타']);
            
            const loadedIngredients = Object.entries(recipe.ingredients).map(([n, w]) => ({ name: n, weight: w }));
            setIngredientList(loadedIngredients.length > 0 ? loadedIngredients : [{ name: '', weight: '' }]);
        }
    }, [recipe]);

    // --- 스타일 관리 함수 ---
    const addStyleTag = () => setStyleList([...styleList, '']);
    const updateStyleTag = (index, value) => {
        const newStyles = [...styleList];
        newStyles[index] = value;
        setStyleList(newStyles);
    };
    const removeStyleTag = (index) => {
        if (styleList.length > 1) {
            setStyleList(styleList.filter((_, i) => i !== index));
        }
    };

    // --- 재료 관리 함수 ---
    const addIngredientRow = () => setIngredientList([...ingredientList, { name: '', weight: '' }]);
    const updateIngredient = (index, field, value) => {
        const newList = [...ingredientList];
        newList[index][field] = value;
        setIngredientList(newList);
    };
    const removeIngredientRow = (index) => setIngredientList(ingredientList.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        const ingredientsObj = {};
        ingredientList.forEach(ing => {
            if (ing.name && ing.weight) ingredientsObj[ing.name] = Number(ing.weight);
        });

        // 빈 값인 스타일 태그는 제외하고 저장
        const filteredStyles = styleList.filter(s => s.trim() !== '');

        onSave({
            name,
            category,
            style: filteredStyles.length > 0 ? filteredStyles : ['기타'],
            ingredients: ingredientsObj,
            nutrition: { protein: 20 }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card">
                <h2>{recipe ? '레시피 수정' : '새 레시피 등록'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <input value={name} onChange={e => setName(e.target.value)} required placeholder="예: 소고기 미역국"
                            style={{flex: 1, minWidth: 0}} />
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            <option>주식</option><option>국</option><option>메인반찬</option><option>밑반찬</option>
                        </select>
                    </div>
                    {/* --- 스타일(태그) 입력 섹션 --- */}
                    <div className="styles-section">
                        <div className="section-header">
                            <h3>스타일 태그</h3>
                            <button type="button" className="add-tag-btn" onClick={addStyleTag}>+ 추가</button>
                        </div>
                        <div className="style-tags-container">
                            {styleList.map((s, idx) => (
                                <div key={idx} className="style-tag-input"
                                    style={{display: 'flex', flexDirection: 'row', flex: 1, gap: '5px',}}>
                                    <input 
                                        value={s} 
                                        onChange={e => updateStyleTag(idx, e.target.value)} 
                                        placeholder="예: 한식"
                                        style={{width: '65px'}}
                                    />
                                    <button type="button" onClick={() => removeStyleTag(idx)}>✕</button>
                                </div>
                            ))}
                        </div>
                        </div>

                    {/* --- 재료 입력 섹션 --- */}
                    <div className="ingredients-section">
                        <div className="section-header">
                            <h3>재료 구성</h3>
                            <button type="button" className="add-ing-btn" onClick={addIngredientRow}>+ 재료 추가</button>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        {ingredientList.map((ing, idx) => (
                            <div key={idx} className="ingredient-row"
                                style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                                <input placeholder="재료명"
                                    value={ing.name}
                                    onChange={e => updateIngredient(idx, 'name', e.target.value)}
                                    style={{flex: 1, minWidth: 0}}/>
                                <input type="number"
                                    placeholder="무게(g)"
                                    min={0}
                                    value={ing.weight}
                                    onChange={e => updateIngredient(idx, 'weight', e.target.value)}
                                    style={{flex: 1, minWidth: 0}}/>
                               
                                <button type="button"
                                    onClick={() => removeIngredientRow(idx)}>✕</button>
                            </div>
                        ))}
                        </div>
                        </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">취소</button>
                        <button type="submit" className="primary-btn">저장하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RecipeFormModal;