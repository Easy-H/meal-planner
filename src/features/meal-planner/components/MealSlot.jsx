import { Plus, X } from 'lucide-react';

function MealSlot({ meal, onOpenSelector, onRemove }) {
    if (!meal || meal.error) {
        return (
            <div className="meal-slot empty" onClick={onOpenSelector}>
                <Plus size={16} />
                <span>추가</span>
            </div>
        );
    }

    return (
        <div className="meal-slot filled"
            onClick={(e) => {
                e.stopPropagation();
                onOpenSelector();
            }}>
            <div className="meal-item-list">
                {
                    meal.items.map((food, idx) => {
                        return (
                            <div key={idx} className="meal-item-name">
                                {food.name}
                            </div>
                        );
                    })
                }
            </div>
            <div className="meal-footer">
                <span className="meal-price">₩{meal.totalCost?.toLocaleString()}</span>
            </div>
            <button className="remove-btn" onClick={(e) => {
                e.stopPropagation();
                onRemove();
            }}>
                <X size={12} />
            </button>
        </div>
    );
}

export default MealSlot;