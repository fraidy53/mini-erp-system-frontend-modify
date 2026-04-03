import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Users,
  ClipboardList,
  ArrowRight,
  Bell
} from 'lucide-react';
import api from '../api/axios';

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.get('/projects');
        setProjects(response.data?.data || []);
      } catch (error) {
        console.error('프로젝트 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="animate-fadeIn">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">프로젝트 관리</h2>
        <div className="flex items-center gap-4">
          <div className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-emerald-100 shadow-sm">관</div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
              <FolderKanban size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">📁 프로젝트 관리</h3>
              <p className="text-sm text-gray-400 font-medium">전체 프로젝트를 생성하고 관리하세요</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/task-create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} />
            프로젝트 생성
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && <p className="text-sm text-gray-400">프로젝트 로딩 중...</p>}
        {!loading && projects.map((project) => (
          <ProjectCard key={project.projectId} {...project} />
        ))}

        <div
          onClick={() => navigate('/admin/task-create')}
          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all mb-4">
            <Plus size={28} />
          </div>
          <span className="text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-colors">새 프로젝트 생성</span>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ title, startDate, endDate, progressRate, status, memberCount, taskCount }) => {
  const statusColorMap = {
    PLANNING: 'purple',
    IN_PROGRESS: 'blue',
    ON_HOLD: 'yellow',
    COMPLETED: 'emerald',
  };

  const statusLabelMap = {
    PLANNING: '기획중',
    IN_PROGRESS: '진행중',
    ON_HOLD: '보류',
    COMPLETED: '완료',
  };

  const colorKey = statusColorMap[status] || 'blue';

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  const progressColorMap = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{title}</h4>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${colorMap[colorKey]}`}>
          {statusLabelMap[status] || status}
        </span>
      </div>

      <p className="text-[11px] text-gray-400 font-medium mb-5">{startDate} - {endDate}</p>

      <div className="mb-6">
        <div className="flex justify-between text-[11px] font-bold mb-2">
          <span className="text-gray-400">진행률</span>
          <span className="text-blue-600">{progressRate || 0}%</span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColorMap[colorKey]} transition-all duration-1000`}
            style={{ width: `${progressRate || 0}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
            <Users size={14} className="text-gray-300" />
            참여자 {memberCount || 0}명
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
            <ClipboardList size={14} className="text-gray-300" />
            Task {taskCount || 0}개
          </div>
        </div>
        <button className="text-[10px] font-black bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 transition-colors flex items-center gap-1">
          상세보기
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProjectManagement;
