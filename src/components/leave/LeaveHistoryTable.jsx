import React, { useEffect, useState } from 'react';

const LeaveHistoryTable = ({ historyData = [] }) => {

    // 상태에 따른 배지 색상 결정 함수
    const getStatusStyle = (status) => {
        switch (status) {
            case '승인': 
            case 'APPROVED': return { bg: '#eefaf3', color: '#2ecc71', text: '승인' };
            case '대기중': 
            case 'PENDING': return { bg: '#fff9e6', color: '#f1c40f', text: '대기중' };
            case '반려': 
            case 'REJECTED': return { bg: '#fdf2f2', color: '#e74c3c', text: '반려' };
            default: return { bg: '#f5f5f5', color: '#888', text: status };
        }
    };

    const leaveTypeLabels = {
    'ANNUAL': '연차',
    'HALF_MORNING': '오전 반차',
    'HALF_AFTERNOON': '오후 반차'
    };

    const sortedHistory = [...historyData].reverse();

    return (
        <div style={styles.container}>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.theadRow}>
                        <th style={styles.th}>신청일</th>
                        <th style={styles.th}>연차 유형</th>
                        <th style={styles.th}>시작일</th>
                        <th style={styles.th}>종료일</th>
                        <th style={styles.th}>일수</th>
                        <th style={styles.th}>사유</th>
                        <th style={styles.th}>상태</th>
                        <th style={styles.th}>비고</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedHistory.length > 0 ? (
                        sortedHistory.map((item) => {
                            const statusInfo = getStatusStyle(item.appStatus || item.status);
                            return (
                                <tr key={item.appId || item.id} style={styles.tr}>
                                    <td style={styles.td}>{item.requestDate || item.createdAt?.slice(0, 10)}</td>
                                    <td style={styles.td}>{leaveTypeLabels[item.appType || item.leaveType] || item.appType || item.leaveType}</td>
                                    <td style={styles.td}>{item.startDate}</td>
                                    <td style={styles.td}>{item.endDate}</td>
                                    <td style={{...styles.td, fontWeight: 'bold'}}>{item.usedDays}일</td>
                                    <td style={styles.td}>{item.requestReason || item.reason}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: statusInfo.bg,
                                            color: statusInfo.color
                                        }}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" style={styles.noData}>신청 내역이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    theadRow: { backgroundColor: '#fafafa', borderBottom: '1px solid #eee' },
    th: { textAlign: 'left', padding: '15px', color: '#666', fontWeight: '600', backgroundColor: '#f5f5f5', },
    td: { padding: '15px', borderBottom: '1px solid #f9f9f9', color: '#333' },
    tr: { transition: '0.2s' },
    badge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    noData: { padding: '50px', textAlign: 'center', color: '#999' }
};

export default LeaveHistoryTable;