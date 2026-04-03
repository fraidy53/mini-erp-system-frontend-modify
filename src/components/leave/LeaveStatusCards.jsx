// src/components/leave/LeaveStatusCards.jsx
import React, { useEffect, useState } from 'react';

const LeaveStatusCards = ({ leaveData = [] }) => {

    const getStatus = (item) => item.appStatus || item.status;

    const stats = {
        total: leaveData.length,
        approved: leaveData.filter(item => getStatus(item) === '승인' || getStatus(item) === 'APPROVED').length,
        pending: leaveData.filter(item => getStatus(item) === '대기중' || getStatus(item) === 'PENDING').length,
        rejected: leaveData.filter(item => getStatus(item) === '반려' || getStatus(item) === 'REJECTED').length
    };

    const cardData = [
        { label: '전체 신청', count: stats.total, icon: '📋', color: '#333' },
        { label: '승인', count: stats.approved, icon: '✅', color: '#2ecc71' },
        { label: '대기중', count: stats.pending, icon: '⏳', color: '#f1c40f' },
        { label: '반려', count: stats.rejected, icon: '❌', color: '#e74c3c' },
    ];

    return (
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
            {cardData.map((data, index) => (
                <div key={index} style={styles.card}>
                    <div style={styles.icon}>{data.icon}</div>
                    <div style={styles.info}>
                        <div style={{ ...styles.count, color: data.color }}>{data.count}</div>
                        <div style={styles.label}>{data.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    card: {
        flex: 1,
        backgroundColor: 'white',
        padding: '20px 25px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    icon: {
        fontSize: '28px',
        width: '50px',
        height: '50px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    info: { display: 'flex', flexDirection: 'column' },
    count: { fontSize: '26px', fontWeight: '800' },
    label: { fontSize: '13px', color: '#888', marginTop: '4px' }
};

export default LeaveStatusCards;