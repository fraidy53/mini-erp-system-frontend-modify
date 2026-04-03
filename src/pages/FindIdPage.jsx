import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Mail, CheckCircle2, LogIn } from 'lucide-react';
import axios from '@/api/axios'; // ✅ axios 임포트 추가

export default function FindIdPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [foundId, setFoundId] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * [수정] 아이디 찾기 제출 핸들러
   * 고정된 "user01" 대신 db.json에서 실제로 검색합니다.
   */
  const handleFindId = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/auth/find-id/request', {
        name: formData.name,
        email: formData.email,
      });

      if (response.data?.success && response.data?.data?.loginId) {
        setFoundId(response.data.data.loginId);
        setStep(2); // 결과 화면으로 이동
      } else {
        alert("입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("아이디 찾기 통신 에러:", error);
      alert(error.response?.data?.message || "서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 py-12 text-gray-900">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-[480px]">
        
        {/* 공통 헤더 */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-100">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 mb-1">WorkFlow</h1>
          <p className="text-sm text-gray-500 font-medium">등록된 정보로 아이디를 찾을 수 있어요</p>
        </div>

        {/* STEP 1: 입력 화면 */}
        {step === 1 && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold text-gray-950 mb-1">아이디 찾기</h2>
              <p className="text-sm text-gray-500">가입 시 입력한 이름과 이메일을 적어주세요</p>
            </div>

            <form onSubmit={handleFindId} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-bold text-gray-700">이름</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name" type="text" required placeholder="이름 입력"
                    value={formData.name} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-gray-700">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email" type="email" required placeholder="이메일 입력"
                    value={formData.email} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                <Search className="w-4 h-4" /> 아이디 찾기
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: 결과 화면 */}
        {step === 2 && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-950 mb-1">아이디를 찾았어요!</h2>
            <p className="text-sm text-gray-500 mb-8">입력하신 정보와 일치하는 계정입니다</p>
            
            <div className="w-full bg-gray-50 p-7 rounded-2xl text-center mb-8 border border-gray-100 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <span className="text-[11px] text-gray-400 font-bold uppercase block mb-2">검색된 아이디</span>
              <span className="text-2xl font-black text-gray-900">{foundId}</span>
            </div>

            <button onClick={() => navigate('/login')} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" /> 로그인하러 가기
            </button>
          </div>
        )}

        {/* 하단 푸터 */}
        <div className="mt-10 flex justify-center gap-4 text-[11px] text-gray-400 border-t pt-6">
          <button onClick={() => navigate('/login')} className="hover:text-blue-600">로그인</button>
          <span className="text-gray-200">|</span>
          <button onClick={() => navigate('/find-pw')} className="hover:text-blue-600">비밀번호 찾기</button>
          <span className="text-gray-200">|</span>
          <button onClick={() => navigate('/signup')} className="hover:text-blue-600 font-bold">회원가입</button>
        </div>
      </div>
    </div>
  );
}