import React, { useState, useEffect } from 'react';
// LayoutCanvas 대신 LayoutDashboard를 사용 (아이콘 에러 방지)
import { LayoutDashboard, ClipboardList, ChevronDown, Loader2 } from 'lucide-react';
import axios from '@/api/axios';

const ProjectPage = () => {
  const [projectProgress, setProjectProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const stateLabelMap = {
    TODO: '대기',
    DOING: '진행중',
    DONE: '완료',
  };

  const labelStateMap = {
    대기: 'TODO',
    진행중: 'DOING',
    완료: 'DONE',
  };

  const priorityLabelMap = {
    HIGH: '높음',
    MEDIUM: '중간',
    LOW: '낮음',
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  // [2026-03-28] 설계서 v2.0 기준 변수명 적용
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [resProjects, resTasks] = await Promise.all([
        axios.get('/projects'),
        axios.get('/tasks'),
      ]);

      const projectList = resProjects.data?.data || [];
      const taskList = resTasks.data?.data || [];

      if (projectList.length > 0) {
        const firstProject = projectList[0];
        const progressRes = await axios.get(`/projects/${firstProject.projectId}/progress`);
        const progressData = progressRes.data?.data;

        setProjectProgress({
          projectId: firstProject.projectId,
          title: firstProject.title,
          period: `${formatDate(firstProject.startDate)} - ${formatDate(firstProject.endDate)}`,
          members: firstProject.memberCount || 0,
          progressRate: progressData?.progressRate ?? firstProject.progressRate ?? 0,
          doneTasks: progressData?.doneTasks ?? 0,
          totalTasks: progressData?.totalTasks ?? firstProject.taskCount ?? 0,
        });
      } else {
        setProjectProgress({
          title: '참여 중인 프로젝트가 없습니다',
          period: '-',
          members: 0,
          progressRate: 0,
          doneTasks: 0,
          totalTasks: 0,
        });
      }

      setTasks(
        taskList.map((task) => ({
          id: task.id,
          taskTitle: task.taskTitle,
          state: stateLabelMap[task.taskState] || task.taskState,
          priority: priorityLabelMap[task.priority] || task.priority,
          endDate: formatDate(task.endDate),
        }))
      );
    } catch (error) {
      console.error("데이터 로드 실패", error);
      setErrorMessage(error.response?.data?.message || '프로젝트/업무 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const handleStateChange = async (taskId, nextLabel) => {
    const nextState = labelStateMap[nextLabel];
    if (!nextState) {
      return;
    }

    try {
      await axios.patch(`/tasks/${taskId}/status`, { taskState: nextState });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, state: nextLabel }
            : task
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 font-sans">
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
        <LayoutDashboard className="text-blue-600" size={24} /> 내 프로젝트/업무
      </h2>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
      
      {/* 프로젝트 요약 카드 */}
      <div className="bg-white p-7 rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="text-orange-400">🏗️</span> {projectProgress?.title}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {projectProgress?.period} · 팀원 {projectProgress?.members}명
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">진행중</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">전체 진행률 (완료 {projectProgress?.doneTasks} / 전체 {projectProgress?.totalTasks})</span>
            <span className="text-blue-600">{projectProgress?.progressRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${projectProgress?.progressRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 업무 리스트 테이블 */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ClipboardList size={18} className="text-orange-500" /> 나의 Task 목록
          </h3>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500">전체</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-5 pl-8">TASK 명</th>
                <th className="p-5 text-center">상태</th>
                <th className="p-5 text-center">우선순위</th>
                <th className="p-5 text-center">마감일</th>
                <th className="p-5 text-right pr-8">상태 변경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-5 pl-8 font-bold text-slate-700">{task.taskTitle}</td>
                  <td className="p-5 text-center">
                    <StatusBadge state={task.state} />
                  </td>
                  <td className="p-5 text-center">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="p-5 text-center text-slate-400 font-bold text-xs">{task.endDate}</td>
                  <td className="p-5 text-right pr-8">
                    <select
                      value={task.state}
                      onChange={(e) => handleStateChange(task.id, e.target.value)}
                      className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 outline-none bg-white text-slate-600 cursor-pointer"
                    >
                      <option value="대기">대기</option>
                      <option value="진행중">진행중</option>
                      <option value="완료">완료</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 이미지와 동일한 상태 뱃지
const StatusBadge = ({ state }) => {
  const styles = {
    "완료": "bg-emerald-50 text-emerald-600",
    "진행중": "bg-blue-50 text-blue-600",
    "대기": "bg-amber-50 text-amber-600"
  };
  return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${styles[state]}`}>{state}</span>;
};

// 이미지와 동일한 우선순위 뱃지
const PriorityBadge = ({ priority }) => {
  const styles = {
    "높음": "bg-red-50 text-red-500",
    "중간": "bg-orange-50 text-orange-500",
    "낮음": "bg-slate-100 text-slate-500"
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-black ${styles[priority]}`}>{priority}</span>;
};

export default ProjectPage;