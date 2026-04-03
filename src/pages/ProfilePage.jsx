import React, { useState, useEffect } from 'react';
import { X, User, Lock, CheckCircle2, Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';
import axios from '@/api/axios';

const ProfilePage = ({ isOpen, onClose, user }) => {
  // 모드 관리: 'profile' (정보 보기), 'changePw' (변경 단계)
  const [mode, setMode] = useState('profile');
  const [step, setStep] = useState(1); // 1:인증번호발송, 2:인증번호입력, 3:새비번, 4:완료
  const [showPw, setShowPw] = useState(false);
  const [resetProof, setResetProof] = useState('');
  const [formData, setFormData] = useState({
    authCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [remainingBalance, setRemainingBalance] = useState(0);

  useEffect(() => {
    if (isOpen) {
      axios.get('/leave/balance')
        .then((response) => {
          const remaining = Number(response.data?.data?.remainingAnnualLeave ?? 0);
          setRemainingBalance(remaining);
        })
        .catch(() => {
          const fallback = Number(user?.remainingAnnualLeave ?? user?.totalAnnualLeave ?? 0);
          setRemainingBalance(fallback);
        });
    }
  }, [isOpen, user?.remainingAnnualLeave, user?.totalAnnualLeave]);

  if (!isOpen) return null;

  // 입력 핸들러
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // 모달 닫을 때 상태 초기화
  const handleClose = () => {
    setMode('profile');
    setStep(1);
    setFormData({ authCode: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  /** [로직] 비밀번호 변경 처리 */
  const handleVerifyUser = () => {
    axios.post('/auth/password/reset/request', { email: user?.email })
      .then((response) => {
        if (response.data?.success) {
          alert(`${user?.email}로 인증번호가 발송되었습니다.`);
          setStep(2);
        }
      })
      .catch((error) => {
        alert(error.response?.data?.message || '인증번호 발송에 실패했습니다.');
      });
  };

  const handleVerifyCode = () => {
    axios.post('/auth/password/reset/verify', {
      email: user?.email,
      verificationCode: formData.authCode,
    }).then((response) => {
      if (response.data?.success && response.data?.data?.resetProof) {
        setResetProof(response.data.data.resetProof);
        setStep(3);
      }
    }).catch((error) => {
      alert(error.response?.data?.message || '인증번호가 일치하지 않습니다.');
    });
  };

  const handleResetPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await axios.post('/auth/password/reset/confirm', {
        resetProof,
        newPassword: formData.newPassword,
        newPasswordConfirm: formData.confirmPassword,
      });
      setStep(4);
    } catch (error) {
      alert(error.response?.data?.message || "변경 실패. 서버를 확인하세요.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {mode === 'profile' ? (
              <><User size={20} className="text-blue-600" /> 내 프로필</>
            ) : (
              <><Key size={20} className="text-blue-600" /> 비밀번호 변경</>
            )}
          </h3>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* --- 1. 프로필 보기 모드 --- */}
        {mode === 'profile' && (
          <>
            <div className="flex flex-col items-center py-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h4 className="text-xl font-extrabold text-gray-800">{user?.userName}</h4>
              <p className="text-sm text-gray-400 font-medium">{user?.department} · {user?.positionName}</p>
            </div>
            <div className="px-6 space-y-3 pb-8">
              <InfoItem label="아이디" value={user?.loginId || user?.userId || '-'} />
              <InfoItem label="이메일" value={user?.email} />
              <InfoItem label="부서" value={user?.department} />
              <InfoItem label="잔여 연차" value={`${remainingBalance}일`} highlight />
            </div>
            <div className="flex gap-2 p-6 pt-0">
              <button onClick={handleClose} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm">닫기</button>
              <button onClick={() => setMode('changePw')} className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md text-sm">비밀번호 변경</button>
            </div>
          </>
        )}

        {/* --- 2. 비밀번호 변경 모드 (FindPwPage 로직) --- */}
        {mode === 'changePw' && (
          <div className="p-6 pt-2">
            {step === 1 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500 text-center">보안을 위해 이메일 인증이 필요합니다.<br/><b>{user?.email}</b></p>
                <button onClick={handleVerifyUser} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg">인증번호 발송</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2 border border-blue-100">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <p className="text-[11px] text-blue-600 font-medium">이메일로 받은 인증번호를 입력하세요.</p>
                </div>
                <input id="authCode" type="text" maxLength={6} value={formData.authCode} onChange={handleChange} placeholder="인증번호 6자리" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center tracking-widest font-bold outline-none focus:border-blue-400" />
                <button onClick={handleVerifyCode} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm">인증 확인</button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input id="newPassword" type={showPw ? "text" : "password"} onChange={handleChange} placeholder="새 비밀번호" className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input id="confirmPassword" type={showPw ? "text" : "password"} onChange={handleChange} placeholder="비밀번호 확인" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                <button onClick={handleResetPassword} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm">비밀번호 재설정</button>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-800 mb-6">변경이 완료되었습니다!</p>
                <button onClick={handleClose} className="w-full py-3.5 bg-gray-800 text-white font-bold rounded-xl text-sm">확인</button>
              </div>
            )}
            
            {step < 4 && (
              <button onClick={() => setMode('profile')} className="w-full mt-4 text-xs text-gray-400 hover:underline">이전으로 돌아가기</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-gray-50">
    <span className="text-sm text-gray-400 font-semibold">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-gray-700'}`}>{value}</span>
  </div>
);

export default ProfilePage;