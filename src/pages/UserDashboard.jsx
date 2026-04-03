import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Send, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

// 페이지 컴포넌트 임포트
import CalendarPage from './CalendarPage'; 
import ProfilePage from './ProfilePage'; 
import LeaveApplyPage from './LeaveApplyPage';   
import LeaveHistoryPage from './LeaveHistoryPage'; 
import ProjectPage from './ProjectPage'; 

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // 현재 활성화된 메뉴 상태 관리
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 메인 콘텐츠 렌더링 함수
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardHome user={user} setActiveMenu={setActiveMenu} />;
      case 'projects':
        return <ProjectPage />;
      case 'calendar':
        return <CalendarPage onNavigateToApply={() => setActiveMenu('leave-apply')} />;
      case 'leave-apply':
        return <LeaveApplyPage onNavigateToHistory={() => setActiveMenu('leave-history')} />;
      case 'leave-history':
        return <LeaveHistoryPage onNavigateToApply={() => setActiveMenu('leave-apply')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 italic">
            <p>{activeMenu} 화면을 준비 중입니다...</p>
            <button 
              onClick={() => setActiveMenu('dashboard')}
              className="mt-4 text-blue-500 not-italic font-semibold underline"
            >
              대시보드로 돌아가기
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 사이드바 사이드바 고정 (fixed) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 text-blue-600 font-bold text-xl cursor-pointer" onClick={() => setActiveMenu('dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">W</div>
          WorkFlow
        </div>
        
        {/* 사용자 요약 정보 */}
        <div className="px-6 py-4 mb-4 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-sm">
              {user?.userName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.userName || '사용자'}</p>
              <p className="text-xs text-gray-500 truncate">
                {user?.department || '개발팀'} · {user?.positionName || '대리'}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="대시보드" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
          <NavItem icon={<FileText size={18}/>} label="내 프로젝트/업무" active={activeMenu === 'projects'} onClick={() => setActiveMenu('projects')} />
          <NavItem icon={<Calendar size={18}/>} label="캘린더" active={activeMenu === 'calendar'} onClick={() => setActiveMenu('calendar')} />
          <NavItem icon={<Send size={18}/>} label="연차 신청" active={activeMenu === 'leave-apply'} onClick={() => setActiveMenu('leave-apply')} />
          <NavItem icon={<ClipboardList size={18}/>} label="신청 내역" badge="2" active={activeMenu === 'leave-history'} onClick={() => setActiveMenu('leave-history')} />
          <NavItem icon={<User size={18}/>} label="내 프로필" active={isProfileOpen} onClick={() => setIsProfileOpen(true)} />
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full p-2 rounded-lg group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 (사이드바 너비만큼 왼쪽 여백 부여) */}
      <main className="flex-1 ml-64 p-8">
        {renderContent()}
      </main>

      {/* 프로필 모달 */}
      <ProfilePage 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </div>
  );
};

/* --- 대시보드 홈 컴포넌트 (이미지 레이아웃 반영) --- */
const DashboardHome = ({ user, setActiveMenu }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({ todoCount: 0, doingCount: 0, doneCount: 0, progressRate: 0 });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ remainingAnnualLeave: 0, totalAnnualLeave: 0 });

  const stateLabelMap = { TODO: '대기', DOING: '진행중', DONE: '완료' };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, projectsRes, tasksRes, leaveRes] = await Promise.allSettled([
          api.get('/dashboard/progress'),
          api.get('/projects'),
          api.get('/tasks'),
          api.get('/leave/balance'),
        ]);

        let fetchedTasks = [];

        if (statsRes.status === 'fulfilled') {
          setDashboardStats(statsRes.value.data?.data || { todoCount: 0, doingCount: 0, doneCount: 0, progressRate: 0 });
        }

        if (projectsRes.status === 'fulfilled') {
          setProjects(projectsRes.value.data?.data || []);
        }

        if (tasksRes.status === 'fulfilled') {
          fetchedTasks = tasksRes.value.data?.data || [];
          setTasks(fetchedTasks);
        }

        // 진행률 API가 실패했거나 0으로만 내려오는 경우 Task 목록으로 안전 폴백
        if (statsRes.status !== 'fulfilled' && fetchedTasks.length > 0) {
          const statusCount = fetchedTasks.reduce(
            (acc, task) => {
              const state = task.taskState || task.taskStatus;
              if (state === 'TODO') acc.todoCount += 1;
              if (state === 'DOING') acc.doingCount += 1;
              if (state === 'DONE') acc.doneCount += 1;
              return acc;
            },
            { todoCount: 0, doingCount: 0, doneCount: 0 }
          );

          const total = statusCount.todoCount + statusCount.doingCount + statusCount.doneCount;
          setDashboardStats({
            ...statusCount,
            progressRate: total > 0 ? (statusCount.doneCount * 100) / total : 0,
          });
        }

        if (leaveRes.status === 'fulfilled') {
          setLeaveBalance(leaveRes.value.data?.data || { remainingAnnualLeave: 0, totalAnnualLeave: 0 });
        } else {
          // leave/balance 호출 실패 시 로그인 사용자 정보 또는 상세 조회값으로 폴백
          const fallbackRemaining = Number(user?.totalAnnualLeave || user?.remainingAnnualLeave || 0);
          if (fallbackRemaining > 0) {
            setLeaveBalance({
              remainingAnnualLeave: fallbackRemaining,
              totalAnnualLeave: fallbackRemaining,
            });
          } else if (user?.id) {
            try {
              const userRes = await api.get(`/users/${user.id}`);
              const remaining = Number(userRes.data?.data?.remainingAnnualLeave || 0);
              setLeaveBalance({
                remainingAnnualLeave: remaining,
                totalAnnualLeave: remaining,
              });
            } catch (fallbackError) {
              console.error('잔여 연차 폴백 조회 실패:', fallbackError);
            }
          }
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activeTaskCount = dashboardStats.todoCount + dashboardStats.doingCount;
  const activeProjects = projects.filter((project) => project.status === 'PROGRESS');
  const scheduleItems = activeProjects.slice(0, 5);
  const todoItems = tasks.slice(0, 4);
  const progressItems = activeProjects.slice(0, 3);
  const averageProgress = progressItems.length > 0
    ? Math.round(progressItems.reduce((sum, p) => sum + (p.progressRate || 0), 0) / progressItems.length)
    : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
          <p className="text-gray-500 text-sm mt-1">
            안녕하세요, <span className="font-semibold text-gray-700">{user?.userName}님!</span> 👋
            현재 <span className="text-blue-600 font-medium">{activeTaskCount}개</span>의 업무가 진행 대기 중입니다.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 bg-blue-800 text-white rounded-lg shadow-md flex items-center justify-center font-bold">
            {user?.userName?.charAt(0) || '김'}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="💼" title={String(activeProjects.length)} sub="진행 중 프로젝트" color="orange" tag="참여 중" />
        <StatCard icon="✅" title={String(dashboardStats.doneCount)} sub="완료한 Task" color="green" tag="누적 완료 건수" />
        <StatCard icon="🕒" title={String(activeTaskCount)} sub="내 진행 업무" color="blue" tag="마감 임박 주의" />
        <StatCard icon="📅" title={`${leaveBalance.remainingAnnualLeave ?? 0}일`} sub="잔여 연차" color="pink" tag={`총 ${leaveBalance.totalAnnualLeave ?? 0}일 중`} />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <h3 className="font-bold text-gray-800">프로젝트 일정</h3>
          </div>
          <button
            onClick={() => setActiveMenu('calendar')}
            className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            캘린더 보기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {scheduleItems.length > 0 ? scheduleItems.map((item) => (
            <ScheduleItem
              key={item.projectId}
              date={item.endDate || '-'}
              title={item.title}
              color="blue"
            />
          )) : (
            <p className="text-sm text-gray-400">표시할 프로젝트 일정이 없습니다.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">📌 나의 할 일 (TODO)</h3>
            <button
              onClick={() => setActiveMenu('projects')}
              className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
            >
              업무 관리 이동 <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {todoItems.length > 0 ? todoItems.map((task) => (
              <TodoItem
                key={task.id}
                title={task.taskTitle}
                project={`프로젝트 #${task.projectId}`}
                status={stateLabelMap[task.taskState] || task.taskState}
                dDay={task.endDate || '-'}
                active={(stateLabelMap[task.taskState] || task.taskState) === '진행중'}
              />
            )) : <p className="text-sm text-gray-400">할 일이 없습니다.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-gray-800 mb-6">📈 참여 중인 프로젝트 현황</h3>
          <div className="space-y-6">
            {progressItems.length > 0 ? progressItems.map((project, idx) => (
              <ProgressItem
                key={project.projectId}
                title={project.title}
                percent={project.progressRate || 0}
                color={idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-emerald-500' : 'bg-purple-500'}
                status={project.status || '-'}
              />
            )) : <p className="text-sm text-gray-400">표시할 프로젝트가 없습니다.</p>}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 mb-1 font-medium">전체 프로젝트 평균 달성도</p>
            <p className="text-4xl font-black text-gray-800">{averageProgress}%</p>
          </div>
        </div>
      </div>
    </>
  );
};

/* --- 소형 컴포넌트들 --- */

const NavItem = ({ icon, label, active = false, badge, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
      ${active ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
    `}
  >
    <div className="flex items-center gap-3">
      {icon} 
      <span className="text-sm">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
        {badge}
      </span>
    )}
  </div>
);

const StatCard = ({ icon, title, sub, color, tag }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl ${colors[color] || 'bg-gray-50'}`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-800">{title}</div>
      <p className="text-gray-500 text-sm mt-1 font-medium">{sub}</p>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className={`text-xs font-bold ${color === 'orange' ? 'text-orange-500' : color === 'green' ? 'text-emerald-500' : color === 'blue' ? 'text-blue-500' : 'text-pink-500'}`}>
          {tag}
        </p>
      </div>
    </div>
  );
};

const ScheduleItem = ({ date, title, color, isLeave = false }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <div className={`p-3 rounded-xl border ${colorMap[color]} flex flex-col gap-1`}>
      <span className="text-[10px] font-bold opacity-70">{date}</span>
      <span className="text-xs font-bold truncate">
        {isLeave && <span className="mr-1">🏖️</span>}
        {title}
      </span>
    </div>
  );
};

const TodoItem = ({ title, project, status, dDay, active = false }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border ${active ? 'border-blue-200 bg-blue-50/30' : 'border-gray-50 bg-white'} hover:border-blue-100 transition-colors`}>
    <div className="flex items-center gap-3">
      {status === '완료' ? <CheckCircle2 size={18} className="text-emerald-500"/> : <div className="w-[18px] h-[18px] border-2 border-gray-200 rounded-full"></div>}
      <div>
        <p className={`text-sm font-bold ${status === '완료' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{title}</p>
        <p className="text-[10px] text-gray-400">{project} · {status}</p>
      </div>
    </div>
    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${status === '완료' ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-500 shadow-sm border border-blue-100'}`}>
      {dDay}
    </span>
  </div>
);

const ProgressItem = ({ title, percent, color, status }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-sm font-bold text-gray-700">{title}</span>
      </div>
      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{status}</span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
    <div className="flex justify-between mt-1">
      <span className="text-[10px] text-gray-400">진척률</span>
      <span className="text-[10px] font-bold text-gray-600">{percent}%</span>
    </div>
  </div>
);

export default UserDashboard;