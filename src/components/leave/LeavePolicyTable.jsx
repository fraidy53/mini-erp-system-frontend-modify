import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const LeavePolicyTable = ({ positionName = "" }) => { // 기본값으로 '대리' 설정
    const [policies, setPolicies] = useState([]);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await api.get('/leave/policy');
                setPolicies(response.data?.data || []);
            } catch (error) {
                console.error('연차 정책 조회 실패:', error);
                setPolicies([]);
            }
        };

        fetchPolicies();
    }, []);

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>📊 직급별 연차 기준</h3>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.theadRow}>
                        <th style={styles.th}>직급</th>
                        <th style={styles.th}>연간 연차</th>
                        <th style={styles.th}>비고</th>
                    </tr>
                </thead>
                <tbody>
                    {policies.map((policy, index) => {
                        const isMyRank = policy.position === positionName;
                        return (
                            <tr key={index} style={isMyRank ? styles.activeRow : styles.tr}>
                                <td style={styles.td}>{policy.position}</td>
                                <td style={{...styles.td, fontWeight: 'bold'}}>{policy.annualLeaveDays}일</td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center' }}>
                                        {isMyRank && <span style={styles.currentBadge}>현재</span>}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* 하단 유의사항 (사진 하단 노란 박스 부분) */}
            <div style={styles.noticeBox}>
                <p style={{fontWeight: 'bold', fontSize: '13px', marginBottom: '5px'}}>⚠️ 유의사항</p>
                <ul style={styles.noticeList}>
                    <li>연차는 입사일 기준으로 부여됩니다.</li>
                    <li>반차는 오전(09:00~13:00), 오후(13:00~18:00)</li>
                    <li>당일/익일 신청은 관리자 승인이 필요합니다.</li>
                    <li>미사용 연차는 다음 해로 이월되지 않습니다.</li>
                </ul>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: 'white', padding: '15px 25px 25px 25px', borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', boxSizing: 'border-box'
    },
    title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { textAlign: 'center', padding: '12px 8px', color: '#888', borderBottom: '1px solid #eee', fontWeight: '500', backgroundColor: '#f5f5f5' },
    td: { textAlign: 'center', padding: '15px 8px', borderBottom: '1px solid #f5f5f5' },
    tr: { transition: '0.2s' },
    // 현재 직급 강조 스타일
    activeRow: { backgroundColor: '#f0f4ff', color: '#254EDB' },
    
    // [현재] 파란색 배지
    currentBadge: {
        padding: '2px 8px', backgroundColor: '#254EDB', color: 'white',
        borderRadius: '10px', fontSize: '11px', fontWeight: 'bold'
    },
    // 하단 노란색 유의사항 박스
    noticeBox: {
        marginTop: '10px', padding: '4px 12px 10px 12px', backgroundColor: '#fffdf0',
        borderRadius: '8px', border: '1px solid #ffecb3', color: '#856404'
    },
    noticeList: {
        margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: '1.8'
    }
};

export default LeavePolicyTable;