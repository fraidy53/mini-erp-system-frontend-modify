import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Building, User, Mail, Lock, Eye, EyeOff, UserPlus, Briefcase, Users, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  
  const [formData, setFormData] = useState({
    userName: '',
    rank: '',
    userId: '', 
    email: '',
    password: '',
    confirmPassword: '',
    department: '', 
  });

  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 유효성 상태 관리
  const [passwordValid, setPasswordValid] = useState({
    isMinLength: false,
    hasNumber: false,
    isMatch: false
  });

  /**
   * [추가] 이메일 유효성 상태 관리
   */
  const [isEmailValid, setIsEmailValid] = useState(false);

  /**
   * 입력값 변경 핸들러
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [id]: value };
      
      // 1. 이메일 형식 검사 (정규표현식)
      if (id === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(value));
      }

      // 2. 비밀번호 실시간 검증
      if (id === 'password' || id === 'confirmPassword') {
        setPasswordValid({
          isMinLength: newData.password.length >= 8,
          hasNumber: /\d/.test(newData.password),
          isMatch: newData.password === newData.confirmPassword && newData.confirmPassword !== ''
        });
      }
      return newData;
    });
  };

  /**
   * 모든 필수 조건 충족 확인 (이메일 유효성 조건 추가됨)
   */
  const isFormValid = 
    formData.userId && 
    formData.userName && 
    formData.rank && 
    isEmailValid && // 이메일 형식이 맞아야 함
    passwordValid.isMinLength && 
    passwordValid.hasNumber && 
    passwordValid.isMatch;

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!passwordValid.isMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const apiData = {
      userId: formData.userId,
      userName: formData.userName,
      email: formData.email,
      password: formData.password,
      positionName: formData.rank,
      department: formData.department
    };

    const result = await signup(apiData);
    if (result.success) {
      alert(result.message);
      navigate('/login');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 py-12">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-[500px]">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-100 p-3 rounded-2xl mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 mb-1">WorkFlow</h1>
          <p className="text-sm text-gray-500">새 계정을 만들어 업무를 시작하세요</p>
        </div>

        <div className="flex border border-gray-200 rounded-full p-1 bg-gray-50 mb-8">
          <button 
            type="button"
            onClick={() => navigate('/login')} 
            className="flex-1 text-center text-sm font-medium py-3 px-6 text-gray-500"
          >
            로그인
          </button>
          <button 
            type="button"
            className="flex-1 text-center text-sm font-semibold py-3 px-6 rounded-full bg-white text-blue-600 shadow-sm"
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* 아이디 */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700 font-bold">아이디 *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                id="userId" 
                type="text" 
                onChange={handleChange} 
                placeholder="영문/숫자 조합 아이디" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 이름 */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">이름 *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  id="userName" 
                  type="text" 
                  onChange={handleChange} 
                  placeholder="이름" 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
                  required 
                />
              </div>
            </div>
            {/* 직급 */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">직급 *</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  id="rank" 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 appearance-none" 
                  required
                >
                  <option value="">선택</option>
                  <option value="사원">사원</option>
                  <option value="대리">대리</option>
                  <option value="과장">과장</option>
                  <option value="팀장">팀장</option>
                </select>
              </div>
            </div>
          </div>

          {/* 이메일 (유효성 체크 디자인 적용) */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700 font-bold">이메일 *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                id="email" 
                type="email" 
                onChange={handleChange} 
                placeholder="company@email.com" 
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${formData.email ? (isEmailValid ? 'border-green-500' : 'border-red-400') : 'border-gray-200'} rounded-xl text-sm outline-none focus:border-blue-400 transition-all`} 
                required 
              />
            </div>
            {formData.email && !isEmailValid && (
              <p className="text-[10px] text-red-500 px-1">올바른 이메일 형식이 아닙니다.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">비밀번호 *</label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  onChange={handleChange} 
                  placeholder="8자 이상" 
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${passwordValid.isMinLength && passwordValid.hasNumber ? 'border-green-500' : 'border-gray-200'} rounded-xl text-sm outline-none focus:border-blue-400 transition-all`} 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">비밀번호 확인 *</label>
              <input 
                id="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                onChange={handleChange} 
                placeholder="재입력" 
                className={`w-full px-4 py-2.5 bg-gray-50 border ${formData.confirmPassword ? (passwordValid.isMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-200'} rounded-xl text-sm outline-none focus:border-blue-400 transition-all`} 
                required 
              />
            </div>
          </div>

          {/* 피드백 메시지 영역 */}
          <div className="px-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passwordValid.isMinLength && passwordValid.hasNumber ? 'bg-green-500' : 'bg-gray-200'}`}>
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
              <span className={`text-[11px] ${passwordValid.isMinLength && passwordValid.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                8자 이상, 숫자 포함
              </span>
            </div>
            {formData.confirmPassword && (
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passwordValid.isMatch ? 'bg-green-500' : 'bg-red-400'}`}>
                  {passwordValid.isMatch ? <CheckCircle2 className="w-2.5 h-2.5 text-white" /> : <span className="text-white text-[8px]">!</span>}
                </div>
                <span className={`text-[11px] ${passwordValid.isMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordValid.isMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                </span>
              </div>
            )}
          </div>

          {/* 부서 */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700 font-bold">부서</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                id="department" 
                type="text" 
                onChange={handleChange} 
                placeholder="소속 부서 (예: 개발팀)" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
              />
            </div>
          </div>

          {/* 가입 버튼 (이메일 조건까지 완벽해야 활성화) */}
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full py-3.5 ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-blue-300 cursor-not-allowed'} text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg`}
          >
            <UserPlus className="w-5 h-5" />
            회원가입
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          이미 계정이 있으신가요?{" "}
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-600 hover:underline font-medium"
          >
            로그인하러 가기
          </button>
        </p>
      </div>
    </div>
  );
}