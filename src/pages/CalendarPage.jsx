import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from '../api/axios'; 
import { Clock, Calendar as CalIcon, Coffee, Plus, Search, CalendarDays } from 'lucide-react';

const CalendarPage = ({ onNavigateToApply }) => {
  // --- [v2.0 설계서 기반 상태 변수명 및 데이터 구조] ---
  const [events, setEvents] = useState([]);
  const [originalLeaveRequests, setOriginalLeaveRequests] = useState([]); // 필터링 전 원본 데이터 보관용
  const [summary, setSummary] = useState({
    workDaysCount: 0,
    leaveUsedCount: 0,
    attendanceRecords: [],
    leaveRequests: [] 
  });

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [apiError, setApiError] = useState('');

  // 데이터 로딩 함수 (재사용을 위해 useCallback 사용)
  const fetchCalendarData = useCallback(async () => {
    try {
      setApiError('');
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthParam = `${year}-${String(month).padStart(2, '0')}`;

      const eventRes = await axios.get(`/calendar/events?year=${year}&month=${month}`);
      const summaryRes = await axios.get(`/attendance/summary?month=${monthParam}`);
      const leaveRes = await axios.get('/leave/my');

      const leaveData = leaveRes.data?.data || [];
      const summaryData = summaryRes.data?.data || {};

      const attendanceRecords = (summaryData.attendanceRecords || []).map((record, index) => {
        const inTime = record.clockInTime || '-';
        const outTime = record.clockOutTime || '-';
        const statusMap = {
          NORMAL: '정상',
          LATE: '지각',
          ABSENT: '결근',
          LEAVE: '연차',
        };

        let status = statusMap[record.status] || '정상';
        if (!record.clockOutTime) {
          status = '미퇴근';
        }

        return {
          id: record.workDate || `att-${index}`,
          date: record.workDate,
          inTime,
          outTime,
          status,
        };
      });

      setOriginalLeaveRequests(leaveData);

      setSummary({
        workDaysCount: summaryData.workDaysCount || 0,
        leaveUsedCount: summaryData.leaveUsedCount || 0,
        attendanceRecords,
        leaveRequests: leaveData
      });

      const mappedEvents = (eventRes.data?.data || []).map(ev => ({
        title: ev.title,
        start: ev.start,
        end: ev.end,
        backgroundColor: ev.type === 'LEAVE' ? '#ef4444' : '#3b82f6',
        allDay: true
      }));
      setEvents(mappedEvents);

    } catch (error) {
      console.error("데이터 로딩 에러:", error);
      setApiError(error.response?.data?.message || '캘린더 데이터를 불러오지 못했습니다.');

      setOriginalLeaveRequests([]);
      setSummary({
        workDaysCount: 0,
        leaveUsedCount: 0,
        attendanceRecords: [],
        leaveRequests: []
      });
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // --- [날짜 검색 기능 구현] ---
  const handleSearch = () => {
    const { start, end } = dateRange;

    if (!start || !end) {
      alert("시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj > endDateObj) {
      alert("시작일이 종료일보다 늦을 수 없습니다.");
      return;
    }

    // 원본 데이터에서 날짜 범위 필터링 (startDate 기준)
    const filtered = originalLeaveRequests.filter(req => {
      const targetDate = new Date(req.startDate);
      return targetDate >= startDateObj && targetDate <= endDateObj;
    });

    setSummary(prev => ({ ...prev, leaveRequests: filtered }));
    
    if (filtered.length === 0) {
      alert("해당 기간 내의 신청 내역이 없습니다.");
    }
  };

  const handleReset = () => {
    setSummary(prev => ({ ...prev, leaveRequests: originalLeaveRequests }));
    setDateRange({ start: '', end: '' });
  };

  // 배경색 로직 유지
  const handleDayCellDidMount = (arg) => {
    const y = arg.date.getFullYear();
    const m = String(arg.date.getMonth() + 1).padStart(2, '0');
    const d = String(arg.date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const record = summary.attendanceRecords.find(r => r.date === dateStr);
    if (record) {
      const colors = { "정상": "#f0fdf4", "지각": "#eff6ff", "초과": "#fff7ed", "미퇴근": "#fef2f2" };
      arg.el.style.backgroundColor = colors[record.status] || 'transparent';
    }
  };

  // 2. 버튼 클릭 시 실행될 핸들러 추가
  const handleGoToApply = () => {
    if (onNavigateToApply) {
      onNavigateToApply(); // 부모(UserDashboard)의 activeMenu를 'leave-apply'로 변경
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      {apiError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {apiError}
        </div>
      )}
      
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={<Clock size={28}/>} count={summary.workDaysCount} label="총 누적 출근일" color="blue" />
        <StatCard icon={<Coffee size={28}/>} count={summary.leaveUsedCount} label="사용 연차 합계" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 캘린더 영역 */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2"><CalIcon className="text-blue-600" /> 근태 및 프로젝트 현황</h3>
            <div className="flex gap-3">
              <LegendItem color="bg-[#f0fdf4]" label="정상" />
              <LegendItem color="bg-[#eff6ff]" label="지각" />
              <LegendItem color="bg-[#fef2f2]" label="미퇴근" />
              <LegendItem color="bg-blue-500" label="프로젝트" />
            </div>
          </div>
          <div className="custom-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              height="650px"
              events={events}
              dayCellDidMount={handleDayCellDidMount}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            />
          </div>
        </div>

        {/* 최근 기록 (역순 정렬) */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Clock size={20} className="text-blue-600" /> 최근 기록 (역순)</h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scroll">
            {[...summary.attendanceRecords]
              .sort((a, b) => new Date(b.date) - new Date(a.date)) 
              .map((record) => (
              <div key={record.id} className="p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-gray-800">{record.date}</p>
                  <StatusBadge status={record.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">{record.inTime} - {record.outTime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 연차 신청 내역 및 검색 섹션 */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><CalIcon size={24} /></div>
            <h3 className="font-bold text-xl">연차 신청 내역</h3>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-gray-200">
              <CalendarDays size={16} className="text-gray-400 mr-2" />
              <input type="date" value={dateRange.start} className="bg-transparent text-xs font-bold outline-none" onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              <span className="mx-2 text-gray-300">~</span>
              <input type="date" value={dateRange.end} className="bg-transparent text-xs font-bold outline-none" onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <button onClick={handleSearch} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-black transition-all"><Search size={14} /> 검색</button>
            <button onClick={handleReset} className="bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-300 transition-all">전체보기</button>
            <button 
              onClick={handleGoToApply} 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus size={16} /> 연차 신청
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-50">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-gray-400 font-semibold border-b">
                <th className="py-5 px-6">신청일</th>
                <th className="py-5 px-4">연차 유형</th>
                <th className="py-5 px-4 text-center">시작일</th>
                <th className="py-5 px-4 text-center">종료일</th>
                <th className="py-5 px-4 text-center">일수</th>
                <th className="py-5 px-4 text-center">상태</th>
                <th className="py-5 px-6 text-right">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary.leaveRequests.map((req) => (
                <tr key={req.appId || req.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="py-6 px-6 text-gray-400">{req.createdAt}</td>
                  <td className="py-6 px-4 font-bold">{req.appType || req.leaveType}</td>
                  <td className="py-6 px-4 text-center">{req.startDate}</td>
                  <td className="py-6 px-4 text-center">{req.endDate}</td>
                  <td className="py-6 px-4 text-center font-black text-blue-600">{req.usedDays}일</td>
                  <td className="py-6 px-4 text-center"><StatusBadge status={req.appStatus || req.status} /></td>
                  <td className="py-6 px-6 text-right">
                    {(req.appStatus || req.status) === "REJECTED" && (
                      <button onClick={() => alert(`[반려 사유]\n${req.rejectReason}`)} className="text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-100">사유 보기</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fc-event { border: none !important; padding: 4px 8px !important; font-size: 11px !important; font-weight: 700 !important; border-radius: 4px !important; margin-bottom: 2px !important; }
        .fc-daygrid-event-harness { margin: 0 4px !important; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .fc-day-sun .fc-daygrid-day-number { color: #ef4444 !important; }
        .fc-day-sat .fc-daygrid-day-number { color: #3b82f6 !important; }
      `}</style>
    </div>
  );
};

// 서브 컴포넌트들
const StatCard = ({ icon, count, label, color }) => (
  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{icon}</div>
    <div><p className="text-4xl font-black text-slate-800 tracking-tight">{count}</p><p className="text-slate-400 font-bold text-xs uppercase mt-1">{label}</p></div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = { "정상": "bg-emerald-50 text-emerald-600", "지각": "bg-blue-50 text-blue-600", "초과": "bg-orange-50 text-orange-600", "미퇴근": "bg-red-50 text-red-600", "결근": "bg-red-100 text-red-700", "연차": "bg-violet-50 text-violet-600", "APPROVED": "bg-emerald-100 text-emerald-700", "PENDING": "bg-amber-100 text-amber-700", "REJECTED": "bg-red-100 text-red-700" };
  const labels = { "APPROVED": "승인", "PENDING": "대기중", "REJECTED": "반려" };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${styles[status] || "bg-slate-100 text-slate-600"}`}>{labels[status] || status}</span>;
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400"><span className={`w-2.5 h-2.5 ${color} rounded-sm border border-gray-100`}></span> {label}</div>
);

export default CalendarPage;