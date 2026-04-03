import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, FolderLock, UserCircle, CheckCircle2, Circle } from 'lucide-react';
import api from '../api/axios';

const AdminProjectAuth = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const [userResponse, teamLeaderResponse] = await Promise.all([
          api.get('/users?page=0&size=100&role=USER'),
          api.get('/users?page=0&size=100&role=TEAM_LEADER'),
        ]);

        const userList = userResponse.data?.data?.content || [];
        const teamLeaderList = teamLeaderResponse.data?.data?.content || [];
        const mergedUsers = [...userList, ...teamLeaderList]
          .filter((user, index, array) => array.findIndex((candidate) => candidate.id === user.id) === index);

        setUsers(mergedUsers);
      } catch (error) {
        console.error('사용자 목록 조회 실패:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(
    () => users.filter((user) => (user.name || '').includes(searchTerm)),
    [users, searchTerm]
  );

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    try {
      const response = await api.get(`/projects/permissions/${user.id}`);
      setProjectList(response.data?.data || []);
    } catch (error) {
      console.error('프로젝트 권한 조회 실패:', error);
      setProjectList([]);
    }
  };

  const handleAuthToggle = (projectId) => {
    setProjectList((prev) =>
      prev.map((proj) =>
        proj.projectId === projectId ? { ...proj, assigned: !proj.assigned } : proj
      )
    );
  };

  const handleSaveAuth = async () => {
    if (!selectedUser) return alert('사용자를 먼저 선택해주세요.');

    const assignedProjectIds = projectList
      .filter((project) => project.assigned)
      .map((project) => project.projectId);

    try {
      await api.put(`/projects/permissions/${selectedUser.id}`, { assignedProjectIds });
      alert(`${selectedUser.name}님의 프로젝트 접근 권한이 업데이트되었습니다.`);
    } catch (error) {
      alert(error.response?.data?.message || '권한 저장에 실패했습니다.');
    }
  };

  return (
    <div className="animate-fadeIn p-6 bg-gray-50/30 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          🔐 권한 부여
        </h2>
        <p className="text-sm text-gray-400 mt-1">사용자에게 프로젝트 접근 권한을 부여하세요.</p>
      </header>

      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        <section className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <UserCircle size={18} className="text-blue-500" /> 사용자 목록
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="이름 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 outline-none w-48"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[500px]">
            {loadingUsers && <p className="p-4 text-sm text-gray-400">사용자 로딩 중...</p>}
            {!loadingUsers && filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 mx-4 my-2 rounded-xl cursor-pointer transition-all flex items-center justify-between border
                  ${selectedUser?.id === user.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-transparent hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${selectedUser?.id === user.id ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {user.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{user.name}</p>
                    <p className="text-[11px] text-gray-400">{user.departmentName} · {user.position}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-400 rounded-md uppercase">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-1">
              <FolderLock size={18} className="text-orange-500" /> 프로젝트 권한 설정
            </h3>
            {selectedUser ? (
              <p className="text-xs text-blue-500 font-medium">
                {selectedUser.name} ({selectedUser.departmentName} · {selectedUser.position}) - 프로젝트 권한 설정중
              </p>
            ) : (
              <p className="text-xs text-gray-400">사용자를 선택하면 권한 설정이 활성화됩니다.</p>
            )}
          </div>

          <div className={`flex-1 p-8 space-y-4 ${!selectedUser && 'opacity-40 pointer-events-none'}`}>
            {projectList.map((project) => (
              <div
                key={project.projectId}
                onClick={() => handleAuthToggle(project.projectId)}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-gray-700">{project.title}</p>
                  <p className={`text-[11px] mt-0.5 font-semibold ${project.assigned ? 'text-blue-500' : 'text-gray-300'}`}>
                    {project.assigned ? '현재 참여중' : '현재 미참여'}
                  </p>
                </div>

                <div className={`flex items-center gap-2 text-xs font-bold ${project.assigned ? 'text-blue-600' : 'text-gray-400'}`}>
                  {project.assigned ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  <span className="w-8">{project.assigned ? '참여' : '미참여'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <button
              onClick={handleSaveAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              권한 저장
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminProjectAuth;
