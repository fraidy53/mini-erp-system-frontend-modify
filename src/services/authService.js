import axios from 'axios';

const API_URL = '/api/v1/auth';

/**
 * 회원가입 API 호출 함수
 * @param {Object} userData - 이름, 아이디, 이메일, 비밀번호, 직급, 부서 정보
 */
export const signup = async (userData) => {
  try {
    // POST 방식으로 회원가입 데이터 전송
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    // 서버에서 에러 응답이 올 경우 예외 처리
    throw error.response ? error.response.data : new Error('네트워크 오류');
  }
};

/**
 * 로그인 API 호출 함수
 * @param {string} userId - 사용자 아이디
 * @param {string} password - 비밀번호
 */
export const login = async (userId, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { id: userId, password });
    
    // 로그인 성공 시 서버에서 받은 JWT 토큰을 로컬 스토리지에 저장
    if (response.data?.data?.accessToken) {
      localStorage.setItem('user_token', response.data.data.accessToken);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('로그인 실패');
  }
};