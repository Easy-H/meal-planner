import { useState, useEffect } from 'react';
import { LocalRecipe as recipeService } from '../features/recipes/api/LocalRecipe';
import RecipeManager from '../features/recipes/components/RecipeManager';
import RecipeFormModal from '../features/recipes/components/RecipeFormModal.jsx';

function RecipePage() {
    const [foods, setFoods] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [initialName, setInitialName] = useState(null);

    useEffect(() => {
        setFoods(recipeService.getRecipes());
    }, []);

    const handleSave = (recipeData) => {
        let updatedFoods;
        if (editingRecipe) {
            // 수정 모드
            updatedFoods = foods.map(f => f.id === editingRecipe.id ? { ...recipeData, id: f.id } : f);
        } else {
            // 신규 등록 모드
            updatedFoods = [...foods, { ...recipeData, id: Date.now() }];
        }
        setFoods(updatedFoods);
        recipeService.saveRecipes(updatedFoods);
        closeModal();
    };
    
    const handleDelete = (id) => {
        const updated = foods.filter(f => f.id !== id);
        setFoods(updated);
        recipeService.saveRecipes(updated);
    };

    const openEditModal = (recipe) => {
        setEditingRecipe(recipe);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRecipe(null);
    };

    return (
        <div className="page-container">

            <RecipeManager 
                foods={foods} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
                onAdd={(name)=> {
                        setInitialName(name);
                        setIsModalOpen(true);
                    }}
            />

            {isModalOpen && (
                <RecipeFormModal 
                    recipe={editingRecipe} 
                    initialName={initialName}
                    onSave={handleSave} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
}

export default RecipePage;