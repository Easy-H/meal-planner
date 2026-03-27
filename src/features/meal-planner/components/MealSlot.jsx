function MealSlot({ meal, onOpenSelector, onRemove }) {
    if (!meal || meal.error) {
        return (
            <div className="meal-slot empty" onClick={onOpenSelector}>
                <span>+ 식단 추가</span>
            </div>
        );
    }

    return (
        <div className="meal-slot filled"
            onClick={(e) => {
                e.stopPropagation();
                onOpenSelector();
            }}>
            {
                meal.items.map((food, idx) => {
                    return (
                    <div key={idx}className="name">{food.name}</div>
                    );
                })
            }
            <hr/>
            <div className="meal-info">
                <span className="price">₩{meal.totalCost?.toLocaleString()}</span>
            </div>
            <button className="remove-btn" onClick={(e) => {
                e.stopPropagation();
                onRemove();
            }}>✕</button>
        </div>
    );
}

export default MealSlot;