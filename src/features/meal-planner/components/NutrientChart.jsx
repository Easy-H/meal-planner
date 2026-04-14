import React from 'react';

const NutrientChart = ({ nutrition }) => {
    const { carbs = 0, protein = 0, fat = 0 } = nutrition;
    const total = carbs + protein + fat;

    if (total === 0) return null;

    const pCarbs = (carbs / total) * 100;
    const pProtein = (protein / total) * 100;
    const pFat = (fat / total) * 100;

    return (
        <div className="nutrient-summary">
            <div className="nutrient-bars">
                <div className="n-bar carbs" style={{ width: `${pCarbs}%` }}></div>
                <div className="n-bar protein" style={{ width: `${pProtein}%` }}></div>
                <div className="n-bar fat" style={{ width: `${pFat}%` }}></div>
            </div>
            <div className="nutrient-labels">
                <span title="탄수화물">탄 {Math.round(pCarbs)}%</span>
                <span title="단백질">단 {Math.round(pProtein)}%</span>
                <span title="지방">지 {Math.round(pFat)}%</span>
            </div>
        </div>
    );
};

export default NutrientChart;