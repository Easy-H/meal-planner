import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ChefHat, CalendarDays, Calculator, BarChart3 } from 'lucide-react';
import PlannerPage from './pages/PlannerPage';
import RecipePage from './pages/RecipePage';
import InventoryPage from './pages/InventoryPage';
import AnalysisPage from './pages/AnalysisPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <main className="tab-content">
          <Routes>
            {/* 기본 경로를 /planner로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/planner" replace />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/recipes" element={<RecipePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
          </Routes>
        </main>
      </div>
      <nav className="tab-nav">
        {/* NavLink를 사용하면 현재 활성화된 탭에 'active' 클래스가 자동으로 붙습니다. */}
        <NavLink to="/recipes" className={({ isActive }) => isActive ? 'active' : ''}>
          <ChefHat size={20} strokeWidth={2.5} />
          <span>레시피 관리</span>
        </NavLink>
        <NavLink to="/planner" className={({ isActive }) => isActive ? 'active' : ''}>
          <CalendarDays size={20} strokeWidth={2.5} />
          <span>식단 생성</span>
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
          <BarChart3 size={20} strokeWidth={2.5} />
          <span>식단 분석</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
          <Calculator size={20} strokeWidth={2.5} />
          <span>식재료 사전</span>
        </NavLink>
      </nav>
    </HashRouter>
  );
}

export default App;