import React, { useEffect, useState } from 'react';
import { Rocket, Send, UserCheck, ClipboardList, Calendar, AlignLeft } from 'lucide-react';
import api from '../api/axios';

const TaskCreate = () => {
  const [leaders, setLeaders] = useState([]);
  const [formData, setFormData] = useState({
    leaderId: '',
    title: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM',
    description: ''
  });

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await api.get('/projects/leaders');
        setLeaders(response.data?.data || []);
      } catch (error) {
        console.error('리더 목록 조회 실패:', error);
      }
    };

    fetchLeaders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/projects', {
        title: formData.title,
        content: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        leaderId: Number(formData.leaderId),
      });

      alert(`[${formData.title}] 프로젝트가 성공적으로 생성되었습니다.`);
      setFormData({
        leaderId: '',
        title: '',
        startDate: '',
        endDate: '',
        priority: 'MEDIUM',
        description: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || '프로젝트 생성에 실패했습니다.');
    }
  };

  return (
    <div className="animate-fadeIn p-6">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          🚀 프로젝트 생성 (새 Project 생성)
        </h2>
        <p className="text-sm text-gray-400 mt-1">프로젝트 리더를 지정해 새 프로젝트를 등록합니다.</p>
      </header>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4 text-purple-600">
          <Rocket size={20} />
          <h3 className="font-bold text-gray-700">새 Project 생성</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">담당 팀장 선택 *</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 text-purple-400" size={18} />
              <select
                name="leaderId"
                value={formData.leaderId}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
                required
              >
                <option value="">-- 프로젝트 리더를 선택하세요 --</option>
                {leaders.map((leader) => (
                  <option key={leader.userId} value={leader.userId}>
                    {leader.userName} (담당 프로젝트 {leader.assignedProjectCount}개)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Project 제목 *</label>
            <div className="relative">
              <ClipboardList className="absolute left-3 top-3 text-gray-300" size={18} />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="새로운 프로젝트 명칭을 입력하세요"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">시작일 *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">종료일(마감) *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">우선순위 설정</label>
            <div className="flex gap-4">
              {[
                { label: '낮음', value: 'LOW' },
                { label: '중간', value: 'MEDIUM' },
                { label: '높음', value: 'HIGH' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority: p.value }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    formData.priority === p.value
                      ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600'
                      : 'bg-gray-50 border border-gray-200 text-gray-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">프로젝트 설명</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-gray-300" size={18} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="프로젝트 목표와 설명을 입력하세요"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <div className="bg-white/20 p-1 rounded-full"><Send size={16} /></div>
            Project 생성 및 배정
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskCreate;
