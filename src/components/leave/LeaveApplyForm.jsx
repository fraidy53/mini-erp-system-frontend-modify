import React, { useState } from 'react';
import api from '../../api/axios';

const LeaveApplyForm = ({ remainingBalance = 0, user }) => {
    // 1. [상태 관리] 입력 폼 데이터
    const [formData, setFormData] = useState({
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    // 2. 사용 일수 계산 (주말/공휴일 제외)
    const calculateUsedDays = () => {
        const { startDate, endDate, leaveType } = formData;
        if (!startDate || !endDate) return 0;

        if (leaveType.includes('HALF')) return 0.5;

        const holidays = [
            '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18',
            '2026-03-01', '2026-05-05', '2026-05-24', '2026-06-06',
            '2026-08-15', '2026-09-24', '2026-09-25', '2026-09-26',
            '2026-10-03', '2026-10-09', '2026-12-25',
        ];

        let start = new Date(startDate);
        let end = new Date(endDate);
        let count = 0;

        const current = new Date(start);
        while (current <= end) {
            const day = current.getDay();
            const dateString = current.toISOString().split('T')[0];
            const isWeekend = (day === 0 || day === 6);
            const isHoliday = holidays.includes(dateString);

            if (!isWeekend && !isHoliday) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    const calculatedDays = calculateUsedDays();
    const isBalanceExceeded = calculatedDays > remainingBalance;

    // 3. [핸들러] 입력값 변경
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isBalanceExceeded) {
            alert("❌ 잔여 연차가 부족하여 신청할 수 없습니다.");
            return;
        }

        try {
            const response = await api.get('/leave/my');
            const existingHistory = response.data?.data || [];

            // 중복 체크 
            const newStart = new Date(formData.startDate);
            const newEnd = new Date(formData.endDate);

            const isOverlapped = existingHistory.some(item => {
                if (item.appStatus === 'REJECTED') return false;

                const existStart = new Date(item.startDate);
                const existEnd = new Date(item.endDate);
                return newStart <= existEnd && newEnd >= existStart;
            });

            if (isOverlapped) {
                alert("⚠️ 선택한 기간에 이미 신청된 연차가 있습니다.");
                return;
            }

            const newRequest = {
                appType: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                requestReason: formData.reason || '개인 사유',
            };

            await api.post('/leave', newRequest);

            alert("✅ 연차 신청이 정상적으로 완료되었습니다.");
            
            // ---------------------------------------

        } catch (err) {
            console.error("신청 중 에러 발생:", err); 
            alert(`⚠️ 신청 처리 중 오류가 발생했습니다.`);
        }
    };
    // UI 렌더링 (기본 스타일 유지)
    return (
        <div style={styles.card}>
            <h3 style={styles.title}>📝 연차 신청서</h3>
            <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>연차 유형 *</label>
                    <select name="leaveType" value={formData.leaveType} onChange={handleChange} style={styles.select}>
                        <option value="ANNUAL">연차</option>
                        <option value="HALF_MORNING">오전 반차 (0.5일)</option>
                        <option value="HALF_AFTERNOON">오후 반차 (0.5일)</option>
                    </select>
                </div>

                <div style={styles.row}>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>시작일 *</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>종료일 *</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={styles.input} />
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>신청 사유</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} style={styles.textarea} placeholder="사유를 입력하세요" />
                </div>

                {calculatedDays > 0 && (
                    <div style={styles.previewBox}>
                        <span style={styles.previewLabel}>차감 예정 연차</span>
                        <div style={styles.previewContent}>
                            <strong>{calculatedDays.toFixed(1)}일 차감</strong>
                            <span style={styles.arrow}>→</span>
                            <span>잔여 <strong style={{color: '#254EDB'}}>{(remainingBalance - calculatedDays).toFixed(1)}일</strong></span>
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isBalanceExceeded || calculatedDays === 0}
                    style={{
                        ...styles.button, 
                        backgroundColor: (isBalanceExceeded || calculatedDays === 0) ? '#ccc' : '#254EDB',
                        marginTop: calculatedDays > 0 ? '10px' : '20px'
                    }}
                >
                    연차 신청하기
                </button>
            </form>
        </div>
    );
};

// 스타일 객체 (기존과 동일)
const styles = {
    card: { backgroundColor: 'white', padding: '15px 25px 25px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'},
    title: { fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' },
    inputGroup: { marginBottom: '15px' },
    row: { display: 'flex', gap: '15px', marginBottom: '15px' },
    label: { display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' },
    select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', height: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', resize: 'none', boxSizing: 'border-box' },
    button: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', transition: '0.3s' },
    previewBox: { backgroundColor: '#f0f4ff', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #d6e4ff' },
    previewLabel: { display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px' },
    previewContent: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#333' },
    arrow: { color: '#aaa', fontWeight: 'bold' }
};

export default LeaveApplyForm;