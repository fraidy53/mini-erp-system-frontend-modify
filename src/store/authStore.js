import { create } from 'zustand';
import axios from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user_info')) || null,
  isAuthenticated: !!localStorage.getItem('user_token'),

  signup: async (payload) => {
    try {
      const positionMap = {
        사원: 'STAFF',
        대리: 'SENIOR',
        과장: 'MANAGER',
        팀장: 'TEAM_LEADER',
      };

      const departmentCodeMap = {
        개발팀: '01',
        유지보수팀: '02',
        모바일개발팀: '03',
      };

      const requestBody = {
        id: payload.userId || payload.id,
        name: payload.userName || payload.name,
        email: payload.email,
        password: payload.password,
        position: positionMap[payload.rank] || payload.position || payload.positionName || 'STAFF',
        departmentCode:
          payload.departmentCode || departmentCodeMap[payload.department] || payload.department || '01',
      };

      const response = await axios.post('/auth/signup', requestBody);

      if (response.status === 201 && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '회원가입이 완료되었습니다.',
        };
      }

      return {
        success: false,
        message: response.data?.message || '회원가입에 실패했습니다.',
      };
    } catch (error) {
      const message = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      return { success: false, message };
    }
  },

  login: async (credentials) => {
    try {
      const loginData = {
        id: credentials.userId || credentials.id || credentials.loginId,
        password: credentials.password || credentials.pw
      };
      const response = await axios.post('/auth/login', loginData);

      if (response.status === 200 && response.data.success) {
        const { accessToken, user } = response.data.data;
        const loginId = credentials.userId || credentials.id || credentials.loginId || '';
        const normalizedUser = {
          ...user,
          userId: loginId,
          loginId,
          userPk: user.id,
          userName: user.name,
          department: user.departmentName,
          positionName: user.position,
          user_role: user.role,
          totalAnnualLeave: user.remainingAnnualLeave,
        };

        localStorage.setItem('user_token', accessToken);
        localStorage.setItem('user_info', JSON.stringify(normalizedUser));

        set({
          user: normalizedUser,
          isAuthenticated: true
        });

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("로그인 에러 상세:", error.response?.data || error.message);
      
      const message = error.response?.data?.message || '아이디 또는 비밀번호를 확인하세요.';
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkRole: () => {
    const user = get().user;
    return user ? (user.user_role || user.role) : null;
  }
}));