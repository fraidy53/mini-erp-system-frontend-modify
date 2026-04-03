import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore'; 
import { Building, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  
  // 상태 관리: 사용자 입력값 및 비밀번호 표시 여부
  const [userId, setUserId] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // authStore에서 로그인 함수 가져오기
  const { login } = useAuthStore();

  /**
   * 로그인 버튼 클릭 시 실행되는 핸들러
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. authStore의 login 함수를 호출 (팀원 가이드에 맞춰 id/password로 전달됨)
    const result = await login({
      userId: userId, 
      password: password
    });
    
    if (result.success) {
      // 2. 로그인 성공 시 사용자 권한(Role) 확인
      // 서버 응답 구조인 result.data.data.user 에서 정보를 가져옵니다.
      const userInfo = result.data?.data?.user;
      
      // DB 컬럼명에 따라 role 혹은 user_role 모두 대응할 수 있도록 수정
      const userRole = userInfo?.role || userInfo?.user_role; 

      console.log("로그인 성공! 사용자 권한:", userRole);

      if (userRole === 'ADMIN' || userRole === 'TEAM_LEADER') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard'); 
      }
    } else {
      // 3. 로그인 실패 시 서버 에러 메시지 출력
      alert(result.message || "아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-[480px]">
        
        {/* 로고 및 서비스 타이틀 */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-100 p-3 rounded-2xl mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 mb-1">WorkFlow</h1>
          <p className="text-sm text-gray-500">사내 업무 관리 그룹웨어에 오신 것을 환영합니다</p>
        </div>

        {/* 로그인/회원가입 탭 버튼 영역 */}
        <div className="flex border border-gray-200 rounded-full p-1 bg-gray-50 mb-8">
          <button 
            type="button"
            className="flex-1 text-center text-sm font-semibold py-3 px-6 rounded-full bg-white text-blue-600 shadow-sm"
          >
            로그인
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/signup')}
            className="flex-1 text-center text-sm font-medium py-3 px-6 text-gray-500 hover:text-gray-700 transition-colors"
          >
            회원가입
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-950 mb-1">다시 만나서 반가워요! 👋</h2>
          <p className="text-sm text-gray-500">아이디와 비밀번호를 입력하여 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* 아이디 입력란 */}
          <div className="space-y-1.5">
            <label htmlFor="userId" className="text-sm font-medium text-gray-700">아이디</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4 text-gray-400" />
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력란 */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="····"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                required
              />
              {/* 비밀번호 보기/숨기기 토글 버튼 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-4" /> : <Eye className="w-5 h-4" />}
              </button>
            </div>
          </div>

          {/* 로그인 실행 버튼 */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm"
          >
            <LogIn className="w-5 h-5" />
            로그인
          </button>
        </form>

        {/* 하단 보조 메뉴 */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500 space-x-1.5 flex items-center justify-center">
          <button type="button" onClick={() => navigate('/find-id')} className="hover:text-blue-600">
            아이디 찾기
          </button>
          <span className="text-gray-200">|</span>
          <button type="button" onClick={() => navigate('/find-pw')} className="hover:text-blue-600">
            비밀번호 찾기
          </button>
          <span className="text-gray-200">|</span>
          <button type="button" onClick={() => navigate('/signup')} className="hover:text-blue-600 font-bold">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}