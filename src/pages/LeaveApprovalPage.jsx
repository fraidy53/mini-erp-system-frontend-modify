import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const LeaveApprovalPage = () => {
  const { user } = useAuthStore();
  const currentRole = user?.role || user?.user_role;

  const [activeTab, setActiveTab] = useState('leave');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchAll = async () => {
    try {
      const [leaveRes, overtimeRes] = await Promise.all([
        api.get('/leave/all'),
        api.get('/overtime/all'),
      ]);

      setLeaveRequests(leaveRes.data?.data || []);
      setOvertimeRequests(overtimeRes.data?.data || []);
    } catch (error) {
      console.error('결재 목록 로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const leavePending = useMemo(() => leaveRequests.filter((r) => r.appStatus === 'PENDING'), [leaveRequests]);
  const leaveApproved = useMemo(() => leaveRequests.filter((r) => r.appStatus === 'APPROVED'), [leaveRequests]);
  const leaveRejected = useMemo(() => leaveRequests.filter((r) => r.appStatus === 'REJECTED'), [leaveRequests]);

  const overtimePending = useMemo(() => overtimeRequests.filter((r) => r.status === 'PENDING'), [overtimeRequests]);
  const overtimeApproved = useMemo(() => overtimeRequests.filter((r) => r.status === 'APPROVED'), [overtimeRequests]);
  const overtimeRejected = useMemo(() => overtimeRequests.filter((r) => r.status === 'REJECTED'), [overtimeRequests]);

  const handleApproveLeave = async (id) => {
    if (!window.confirm('연차 신청을 승인하시겠습니까?')) return;
    try {
      const response = await api.patch(`/leave/${id}/approve`);
      if (response.data?.success) {
        setLeaveRequests((prev) => prev.map((req) => (
          req.appId === id ? { ...req, appStatus: 'APPROVED' } : req
        )));
      }
    } catch (error) {
      alert(error.response?.data?.message || '승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleRejectLeaveSubmit = async () => {
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력하세요.');
      return;
    }

    try {
      const id = selectedLeave?.appId;
      const response = await api.patch(`/leave/${id}/reject`, { rejectReason });
      if (response.data?.success) {
        setLeaveRequests((prev) => prev.map((req) => (
          req.appId === id ? { ...req, appStatus: 'REJECTED', rejectReason } : req
        )));
        setIsModalOpen(false);
        setRejectReason('');
      }
    } catch (error) {
      alert(error.response?.data?.message || '반려 처리 중 오류가 발생했습니다.');
    }
  };

  const handleApproveOvertime = async (id) => {
    if (!window.confirm('특근 신청을 승인하시겠습니까?')) return;
    try {
      const response = await api.patch(`/overtime/${id}/approve`);
      if (response.data?.success) {
        setOvertimeRequests((prev) => prev.map((req) => (
          req.id === id ? { ...req, status: 'APPROVED' } : req
        )));
      }
    } catch (error) {
      alert(error.response?.data?.message || '특근 승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleRejectOvertime = async (id) => {
    if (!window.confirm('특근 신청을 반려하시겠습니까?')) return;
    try {
      const response = await api.patch(`/overtime/${id}/reject`);
      if (response.data?.success) {
        setOvertimeRequests((prev) => prev.map((req) => (
          req.id === id ? { ...req, status: 'REJECTED' } : req
        )));
      }
    } catch (error) {
      alert(error.response?.data?.message || '특근 반려 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">연차 / 특근 결재 관리</h2>
        <p className="text-sm text-gray-500 mt-1">
          현재 권한: {currentRole === 'ADMIN' ? '관리 소장' : '팀장'}
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'leave' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          연차 결재
        </button>
        <button
          onClick={() => setActiveTab('overtime')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'overtime' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          특근 결재
        </button>
      </div>

      {activeTab === 'leave' && (
        <>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <SummaryCard icon="⏳" count={leavePending.length} label="대기 중" />
            <SummaryCard icon="✅" count={leaveApproved.length} label="승인 완료" />
            <SummaryCard icon="❌" count={leaveRejected.length} label="반려됨" />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-xs text-gray-400 font-bold uppercase">
                  <th className="px-6 py-4">신청자</th>
                  <th className="px-6 py-4">유형</th>
                  <th className="px-6 py-4 text-center">상태</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {leaveRequests.length > 0 ? leaveRequests.map((req) => (
                  <tr key={req.appId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-700">{req.requesterName}</td>
                    <td className="px-6 py-4 text-gray-500">{req.appType}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={req.appStatus} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.appStatus === 'PENDING' ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleApproveLeave(req.appId)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600">승인</button>
                          <button onClick={() => { setSelectedLeave(req); setIsModalOpen(true); }} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">반려</button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">처리 완료</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-16 text-center text-gray-400">조회할 연차 신청이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'overtime' && (
        <>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <SummaryCard icon="⏳" count={overtimePending.length} label="대기 중" />
            <SummaryCard icon="✅" count={overtimeApproved.length} label="승인 완료" />
            <SummaryCard icon="❌" count={overtimeRejected.length} label="반려됨" />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-xs text-gray-400 font-bold uppercase">
                  <th className="px-6 py-4">신청자</th>
                  <th className="px-6 py-4">근무일</th>
                  <th className="px-6 py-4">사유</th>
                  <th className="px-6 py-4 text-center">상태</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {overtimeRequests.length > 0 ? overtimeRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-700">{req.requesterName}</td>
                    <td className="px-6 py-4 text-gray-500">{req.overtimeDate} {req.startTime}~{req.endTime}</td>
                    <td className="px-6 py-4 text-gray-500">{req.reason || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.status === 'PENDING' ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleApproveOvertime(req.id)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600">승인</button>
                          <button onClick={() => handleRejectOvertime(req.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">반려</button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">처리 완료</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-16 text-center text-gray-400">조회할 특근 신청이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-800">반려 사유 입력</h3>
            <textarea
              className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              placeholder="사유를 입력하세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold">취소</button>
              <button onClick={handleRejectLeaveSubmit} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600">반려 확정</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, count, label }) => (
  <div className="bg-white p-6 rounded-xl border flex items-center gap-4">
    <div className="text-2xl">{icon}</div>
    <div><p className="text-2xl font-bold">{count}</p><p className="text-xs text-gray-400">{label}</p></div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
    status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600'
      : status === 'REJECTED' ? 'bg-red-50 text-red-600'
      : 'bg-orange-50 text-orange-600'
  }`}>
    {status}
  </span>
);

export default LeaveApprovalPage;
