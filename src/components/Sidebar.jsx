import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; // Zustand 스토어 연결
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ClipboardList, 
  Calendar, 
  FolderKanban, 
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Zustand 스토어에서 유저 정보와 로그아웃 함수 가져옴
  const { user, logout } = useAuthStore(); 
  const currentRole = user?.role || user?.user_role;

  // 현재 활성화된 메뉴인지 확인하는 함수 (UI 하이라이트 결정)
  const isActive = (path) => location.pathname === path;

  /**
   * [수정] 로그아웃 핸들러
   * 단순히 navigate만 하면 App.jsx의 라우트 설정 문제로 이동이 안 될 수 있습니다.
   * window.location.replace를 사용하여 강제로 페이지를 새로고침하며 로그인창으로 보냅니다.
   */
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      console.log("1. 로그아웃 프로세스 시작 (스토어 초기화)");
      
      // 1. Zustand 상태 및 로컬스토리지 삭제 실행
      logout(); 
      
      console.log("2. 로그인 페이지로 강제 리다이렉트 실행");
      
      // 2. 리액트 내부 navigate가 작동하지 않을 경우를 대비한 강제 이동 방식
      // replace를 사용하면 뒤로가기로 다시 관리자 페이지에 오는 것을 방지합니다.
      window.location.replace('/login');
    }
  };

  const commonManagerMenus = [
    { icon: <LayoutDashboard size={18} />, label: '관리자 대시보드', path: '/admin/dashboard' },
    { icon: <ClipboardList size={18} />, label: '업무 배정(수정)', path: '/admin/task-edit' },
    { icon: <Calendar size={18} />, label: '연차/특근 승인', path: '/admin/approvals' },
  ];

  const adminOnlyMenus = [
    { icon: <ShieldCheck size={18} />, label: '권한 부여', path: '/admin/project-auth' },
  ];

  const menuItems = currentRole === 'ADMIN'
    ? [...commonManagerMenus, ...adminOnlyMenus]
    : commonManagerMenus;

  return (
    <div className="flex flex-col h-full p-6 bg-white shadow-sm border-r border-gray-100 overflow-y-auto">
      
      {/* 1. 로고 영역 */}
      <div 
        className="flex items-center gap-2 mb-10 px-2 cursor-pointer"
        onClick={() => navigate('/admin/dashboard')}
      >
        <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-serif shadow-sm">W</div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-blue-900 leading-none tracking-tight">WorkFlow</span>
          <span className="text-[10px] text-gray-400 font-medium">(관리자 시스템)</span>
        </div>
      </div>

      {/* 2. 관리자 프로필 섹션 */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
          {user?.userName?.charAt(0) || '관'}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{user?.userName || '관리자'}</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[11px] text-gray-400 font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* 3. 메인 메뉴 리스트 */}
      <nav className="flex-1 space-y-8">
        <div>
          <p className="text-[10px] font-bold text-gray-400 ml-2 mb-4 uppercase tracking-[0.15em]">Admin Menus</p>
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${
                  isActive(item.path) 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive(item.path) && (
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 프로젝트 그룹 */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 ml-2 mb-4 uppercase tracking-[0.15em]">Projects</p>
          <button
            onClick={() => navigate('/admin/projects')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
              isActive('/admin/projects') 
                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderKanban size={18} />
              <span className="text-sm">프로젝트 관리</span>
            </div>
            {isActive('/admin/projects') && (
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            )}
          </button>

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin/task-create')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive('/admin/task-create')
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={18} />
                <span className="text-sm">프로젝트 생성</span>
              </div>
              {isActive('/admin/task-create') && (
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* 4. 하단 로그아웃 영역 */}
      <div className="pt-6 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-orange-500 font-bold hover:bg-orange-50 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">로그아웃</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;