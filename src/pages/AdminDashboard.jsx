import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [adminSummary, setAdminSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [taskStatus, setTaskStatus] = useState({ TODO: 0, DOING: 0, DONE: 0, delayed: 0 });

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      try {
        const [summaryRes, projectRes, leaveRes, taskRes] = await Promise.all([
          api.get('/dashboard/admin-summary'),
          api.get('/dashboard/projects'),
          api.get('/leave/all'),
          api.get('/tasks'),
        ]);

        const summary = summaryRes.data?.data;
        const dashboardProjects = projectRes.data?.data || [];
        const leaves = leaveRes.data?.data || [];
        const tasks = taskRes.data?.data || [];

        const pendingLeaves = leaves.filter((item) => item.appStatus === 'PENDING');

        const statusCount = tasks.reduce(
          (acc, task) => {
            if (task.taskState === 'TODO') acc.TODO += 1;
            if (task.taskState === 'DOING') acc.DOING += 1;
            if (task.taskState === 'DONE') acc.DONE += 1;
            return acc;
          },
          { TODO: 0, DOING: 0, DONE: 0, delayed: 0 }
        );

        setAdminSummary(summary);
        setProjects(dashboardProjects);
        setPendingApprovals(pendingLeaves);
        setTaskStatus(statusCount);
      } catch (error) {
        console.error('관리자 대시보드 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>;
  }

  const completionRate = adminSummary?.taskCompletionRate ?? 0;
  const totalTaskCount = adminSummary?.totalTaskCount ?? 0;

  return (
    <div className="animate-fadeIn">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">관리자 대시보드 요약</h2>
        <div className="flex items-center gap-4">
          <div className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-emerald-100 shadow-sm">관</div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <AdminStatCard title="전체 사용자" count={String(adminSummary?.totalUsers ?? 0)} change="실시간 집계" />
        <AdminStatCard title="진행 중 프로젝트" count={String(adminSummary?.activeProjectCount ?? 0)} change={`총 ${projects.length}개 노출`} />
        <AdminStatCard title="연차 승인 대기" count={String(adminSummary?.pendingApprovalCount ?? 0)} change="즉시 처리 필요" color="red" />
        <AdminStatCard title="전체 Task" count={String(totalTaskCount)} change={`완료율 ${completionRate.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">🚩 연차 승인 대기</h3>
          </div>
          <div className="p-2 space-y-1">
            {pendingApprovals.length > 0 ? pendingApprovals.slice(0, 4).map((item) => (
              <ApprovalItem
                key={item.appId}
                name={item.requesterName}
                type={item.appType}
                date={item.startDate}
                reason={item.requestReason || '-'}
                color="blue"
              />
            )) : (
              <p className="p-4 text-sm text-gray-400">승인 대기 중인 연차가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">📊 프로젝트 현황</h3>
          <div className="space-y-6">
            {projects.length > 0 ? projects.slice(0, 3).map((item, idx) => (
              <ProgressItem
                key={item.projectId}
                label={item.title}
                percent={item.progressRate || 0}
                date={item.endDate || '-'}
                color={idx % 3 === 0 ? 'blue' : idx % 3 === 1 ? 'emerald' : 'purple'}
                status={item.status}
              />
            )) : (
              <p className="text-sm text-gray-400">프로젝트 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">📋 Task 상태별 통계</h3>
          <span className="text-[10px] text-gray-400 font-medium">실시간 데이터: 전체 {totalTaskCount}개 Task 기준</span>
        </div>
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-9 grid grid-cols-4 gap-4">
            <TaskStatusCard count={String(taskStatus.TODO)} label="대기" color="blue" />
            <TaskStatusCard count={String(taskStatus.DOING)} label="진행중" color="yellow" />
            <TaskStatusCard count={String(taskStatus.DONE)} label="완료" color="emerald" />
            <TaskStatusCard count={String(taskStatus.delayed)} label="지연" color="red" />
          </div>
          <div className="col-span-3 border-l border-gray-100 pl-6 text-center">
            <p className="text-[11px] text-gray-400 mb-1 font-bold">전체 업무 완료율</p>
            <h4 className="text-3xl font-black text-blue-700 tracking-tight">{completionRate.toFixed(1)}%</h4>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden shadow-inner">
              <div className="bg-blue-600 h-full shadow-sm" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ title, count, change, color }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-[11px] text-gray-400 mb-2 font-bold uppercase tracking-wider">{title}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-black text-gray-800 leading-none tracking-tight">{count}</h4>
      <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        color === 'red' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
      }`}>{change}</p>
    </div>
  </div>
);

const ApprovalItem = ({ name, type, date, reason, color }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${
      color === 'blue' ? 'bg-blue-500' : color === 'purple' ? 'bg-purple-500' : color === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'
    }`}>{name?.charAt(0) || '?'}</div>
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-700">{name} · <span className="font-normal text-gray-500">{type}</span></p>
      <p className="text-[10px] text-gray-400">{date} · {reason}</p>
    </div>
  </div>
);

const ProgressItem = ({ label, percent, date, color, status }) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-bold text-gray-700">
      <span>{label}</span>
      <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{status}</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5 shadow-inner">
      <div className={`h-full transition-all duration-1000 ease-out ${
        color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'
      }`} style={{ width: `${percent}%` }}></div>
    </div>
    <div className="flex justify-between text-[9px] text-gray-400 font-medium">
      <span>진척률 {percent}% · 마감기한 {date}</span>
    </div>
  </div>
);

const TaskStatusCard = ({ count, label, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <div className={`${colorMap[color]} p-4 rounded-xl text-center flex flex-col items-center justify-center border hover:shadow-md transition-all duration-200 cursor-default`}>
      <h5 className="text-2xl font-black mb-1">{count}</h5>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
};

export default AdminDashboard;
