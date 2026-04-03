import React from 'react';

/**
 * @param {string} id - 필드 고유 ID
 * @param {string} label - 라벨 텍스트
 * @param {string} type - input 타입 (text, password, email 등)
 * @param {React.ReactNode} icon - 왼쪽 표시 아이콘 (Lucide Icon)
 * @param {boolean} error - 에러 발생 여부 (빨간 테두리)
 * @param {boolean} success - 유효성 통과 여부 (초록 테두리)
 * @param {string} helperText - 하단 안내 메시지
 */
const Input = ({ 
  id, 
  label, 
  type = "text", 
  icon: Icon, 
  error, 
  success, 
  helperText, 
  className = "", 
  ...props 
}) => {
  // 상태에 따른 테두리 색상 결정
  const getBorderColor = () => {
    if (error) return 'border-red-400 focus:border-red-500';
    if (success) return 'border-green-500 focus:border-green-600';
    return 'border-gray-200 focus:border-blue-400';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm text-gray-700 font-bold">
          {label} {props.required && "*"}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${getBorderColor()}
          `}
          {...props}
        />
        {/* 우측 버튼(비밀번호 보기 등)이 들어올 자리를 위해 props.children 허용 */}
        {props.children}
      </div>
      {helperText && (
        <p className={`text-[10px] px-1 ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;