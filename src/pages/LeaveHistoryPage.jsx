import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LeaveHistoryTable from '../components/leave/LeaveHistoryTable';
import LeaveStatusCards from '../components/leave/LeaveStatusCards';

// [수정] 부모로부터 onNavigateToApply 함수를 받습니다.
const LeaveHistoryPage = ({ onNavigateToApply }) => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/leave/my');
        setLeaveData(response.data?.data || []);
      } catch (error) {
        console.error("내역 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleGoToApply = () => {
    // [추가] 대시보드 상태를 'leave-apply'로 바꿉니다.
    if (onNavigateToApply) onNavigateToApply(); 
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>📋 연차 신청 내역</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>나의 연차 신청 현황을 확인하세요</p>
      </div>

      <LeaveStatusCards leaveData={leaveData} />

      <div style={styles.listContainer}>
        <div style={styles.listHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>연차 신청 목록</h3>
          <button onClick={handleGoToApply} style={styles.applyBtn}>+ 신청하기</button>
        </div>
        <LeaveHistoryTable historyData={leaveData} />
      </div>
    </div>
  );
};

const styles = {
  listContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  applyBtn: { padding: '8px 16px', backgroundColor: '#254EDB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default LeaveHistoryPage;