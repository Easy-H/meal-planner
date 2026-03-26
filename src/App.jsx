import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import PlannerPage from './pages/PlannerPage';
import RecipePage from './pages/RecipePage';
import InventoryPage from './pages/InventoryPage';
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
          </Routes>
        </main>
      </div>
      <nav className="tab-nav">
        {/* NavLink를 사용하면 현재 활성화된 탭에 'active' 클래스가 자동으로 붙습니다. */}
        <NavLink to="/recipes" className={({ isActive }) => isActive ? 'active' : ''}>레시피 관리</NavLink>
        <NavLink to="/planner" className={({ isActive }) => isActive ? 'active' : ''}>식단 생성</NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>원가 관리</NavLink>
      </nav>
    </HashRouter>
  );
}

export default App;