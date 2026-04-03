import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Edit3, Send, UserCheck, Users, AlignLeft } from 'lucide-react';
import api from '../api/axios';

const TaskEdit = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    taskState: 'TODO',
    memberId: '',
    priority: 'MEDIUM',
    dueDate: '',
    description: ''
  });

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

  const loadTasks = async () => {
    const response = await api.get('/tasks');
    setTasks(response.data?.data || []);
  };

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data?.data || []);
        await loadTasks();
      } catch (error) {
        console.error('업무 화면 초기 조회 실패:', error);
      }
    };

    fetchBaseData();
  }, []);

  useEffect(() => {
    const fetchAssignableMembers = async () => {
      if (!formData.projectId) {
        setAvailableMembers([]);
        return;
      }

      try {
        const response = await api.get(`/projects/${formData.projectId}/members/assignable`);
        setAvailableMembers(response.data?.data || []);
      } catch (error) {
        console.error('배정 가능 팀원 조회 실패:', error);
        setAvailableMembers([]);
      }
    };

    fetchAssignableMembers();
  }, [formData.projectId]);

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.projectId) === String(formData.projectId)),
    [projects, formData.projectId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.memberId) {
      alert('담당 팀원을 선택해주세요.');
      return;
    }

    try {
      await api.post('/tasks', {
        projectId: Number(formData.projectId),
        taskTitle: formData.title,
        taskContent: formData.description,
        endDate: formData.dueDate,
        taskState: formData.taskState,
        priority: formData.priority,
        assigneeIds: [Number(formData.memberId)],
      });

      alert('팀원에게 업무 배정이 완료되었습니다.');
      setFormData({
        projectId: '',
        title: '',
        taskState: 'TODO',
        memberId: '',
        priority: 'MEDIUM',
        dueDate: '',
        description: ''
      });
      setAvailableMembers([]);
      await loadTasks();
    } catch (error) {
      alert(error.response?.data?.message || '업무 배정에 실패했습니다.');
    }
  };

  const handleTaskStateChange = async (taskId, nextLabel) => {
    const nextState = labelStateMap[nextLabel];
    try {
      await api.patch(`/tasks/${taskId}/status`, { taskState: nextState });
      setTasks((prev) => prev.map((task) =>
        task.id === taskId ? { ...task, taskState: nextState } : task
      ));
    } catch (error) {
      alert(error.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  return (
    <div className="animate-fadeIn p-2">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">📌 업무 배정 및 수정</h2>
        <p className="text-sm text-gray-400 mt-1">팀원에게 부여할 구체적인 업무 내용을 작성하세요.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit">
          <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
            <Edit3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-gray-700">Task 배정 상세 설정</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">프로젝트 선택 *</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none"
                required
              >
                <option value="">-- 프로젝트 선택 --</option>
                {projects.map((p) => <option key={p.projectId} value={p.projectId}>{p.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">담당 팀장</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 text-blue-400" size={18} />
                <input
                  type="text"
                  value={selectedProject?.leaderName || '프로젝트를 선택하세요'}
                  className="w-full bg-blue-50/50 border border-blue-100 text-blue-700 font-bold rounded-lg pl-10 pr-4 py-2.5 text-sm cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">팀원 배정 *</label>
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                disabled={!formData.projectId}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none"
                required
              >
                <option value="">{formData.projectId ? '-- 팀원 선택 --' : '-- 프로젝트를 먼저 선택하세요 --'}</option>
                {availableMembers.map((m) => <option key={m.userId} value={m.userId}>{m.userName}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Task 제목 *</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="업무의 핵심 제목을 입력하세요"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">업무 상세 내역</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 text-gray-300" size={18} />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="팀원에게 전달할 구체적인 업무 가이드를 입력하세요."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">상태</label>
                <select name="taskState" value={formData.taskState} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none">
                  <option value="TODO">대기</option>
                  <option value="DOING">진행중</option>
                  <option value="DONE">완료</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">우선순위</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none">
                  <option value="LOW">낮음</option>
                  <option value="MEDIUM">중간</option>
                  <option value="HIGH">높음</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">마감일 *</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" required />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-all">
              <Send size={18} className="inline mr-2" />
              업무 배정 완료
            </button>
          </form>
        </section>

        <section className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Users size={20} className="text-orange-500" />
            <h3 className="font-bold text-gray-700">배정 이력 확인</h3>
          </div>
          <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
            {tasks.length > 0 ? tasks.map((task) => (
              <div key={task.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">{task.taskTitle}</p>
                  <p className="text-xs text-gray-400">프로젝트 #{task.projectId} · 우선순위 {priorityLabelMap[task.priority] || task.priority} · 마감 {task.endDate}</p>
                </div>
                <select
                  value={stateLabelMap[task.taskState] || task.taskState}
                  onChange={(e) => handleTaskStateChange(task.id, e.target.value)}
                  className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1"
                >
                  <option value="대기">대기</option>
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                </select>
              </div>
            )) : (
              <div className="h-64 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-sm">
                최근 배정 내역이 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TaskEdit;
