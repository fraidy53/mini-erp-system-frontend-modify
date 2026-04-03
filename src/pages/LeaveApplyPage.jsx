import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveApplyForm from '../components/leave/LeaveApplyForm';
import LeavePolicyTable from '../components/leave/LeavePolicyTable';

const LeaveApplyPage = () => {
  const { user } = useAuthStore(); // 현재 로그인한 사용자 정보
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usedDays, setUsedDays] = useState(0);

  // 1. 서버(db.json)에서 이 사용자의 최신 정보를 가져옵니다.
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get(`/users/${user.id}`);
        if (response.data?.success && response.data?.data) {
          setDbUser(response.data.data);
        }

        const leavesRes = await api.get('/leave/my');
        const approvedTotal = (leavesRes.data?.data || [])
          .filter(item => item.appStatus === 'APPROVED')
          .reduce((acc, cur) => acc + Number(cur.usedDays || 0), 0);

        setUsedDays(approvedTotal);

      } catch (error) {
        console.error("유저 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 관리자가 승인해서 바뀐 '잔여 연차'
  const totalAnnualLeave = Number(dbUser?.remainingAnnualLeave || 0) + Number(usedDays || 0);
  const remainingBalance = totalAnnualLeave - usedDays;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 헤더 영역 */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✈️ 연차 신청</h1>
        <p style={{ color: '#888', marginTop: '10px' }}>연차를 신청하고 잔여 현황을 확인하세요</p>
      </div>

      {/* 1. 상단 카드 (잔여 연차 현황 표시) */}
      <div style={{ width: '100%' }}>
        {/* LeaveBalanceCard 내부에서도 자체적으로 계산하지만, 
            필요시 remainingBalance를 props로 넘길 수도 있습니다. */}
        <LeaveBalanceCard totalAnnualLeave={dbUser?.totalAnnualLeave} 
           usedAnnualLeave={usedDays} remainingAnnualLeave={remainingBalance}/>
      </div>

      {/* 2. 하단 2단 레이아웃 (신청 폼 + 정책 표) */}
      <div style={{ display: 'flex', gap: '30px', width: '100%', alignItems: 'flex-start' }}>
        {/* 왼쪽: 신청 폼 영역 (비중 1.6) */}
        <div style={{ flex: 1.6 }}> 
          {/* 위에서 계산한 remainingBalance를 전달하여 
              신청서 하단에 '잔여 OO일'이 정확히 뜨게 합니다. */}
          <LeaveApplyForm remainingBalance={remainingBalance}
            user={user} />
        </div>

        {/* 오른쪽: 정책 안내 표 영역 (비중 1.4) */}
        <div style={{ flex: 1.4 }}>
          <LeavePolicyTable positionName={dbUser?.position} />
        </div>
      </div>
    </div>
  );
};

export default LeaveApplyPage;