import axios from 'axios';

/**
 * 1. Axios 인스턴스 생성 (가장 먼저 수행되어야 함)
 * baseURL에 /api/v1을 포함하여 모든 요청이 백엔드 API 경로를 기본으로 하도록 설정합니다.
 */
const instance = axios.create({
  // Vite dev server proxy를 통해 요청하여 CORS 이슈를 피합니다.
  baseURL: '/api/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * 2. 요청 인터셉터 설정
 * 생성된 'instance'를 사용하여 모든 요청 전에 실행될 로직을 정의합니다.
 * 로컬 스토리지에 토큰이 있다면 헤더에 자동으로 포함시킵니다.
 */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 외부 파일(authStore.js 등)에서 이 설정을 사용할 수 있도록 내보냅니다.
export default instance;