import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // 기존에 만든 사이드바 컴포넌트

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 고정 사이드바 영역 */}
      <div className="w-64 fixed h-full shadow-lg">
        <Sidebar />
      </div>

      {/* 본문 콘텐츠 영역 (사이드바 너비만큼 왼쪽 마진 부여) */}
      <main className="flex-1 ml-64 p-4">
        {/* Outlet은 현재 URL에 맞는 자식 컴포넌트(Dashboard, TaskEdit 등)가 렌더링되는 곳*/}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;