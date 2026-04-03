import React, { useEffect, useState } from 'react';
//import { leaveApi } from '../../api/leaveApi';

const LeaveBalanceCard = ({ totalAnnualLeave = 0, usedAnnualLeave = 0, remainingAnnualLeave = 0 }) => {

    // 사용률 계산
    const usageRate = totalAnnualLeave > 0 
        ? ((usedAnnualLeave / totalAnnualLeave) * 100).toFixed(1) 
        : 0;

    return (
        <div style={styles.container}>
            <div style={styles.infoWrapper}>
                <div>
                    <span style={styles.label}>잔여 연차</span>
                    <h2 style={styles.count}>{remainingAnnualLeave} <span style={{fontSize: '20px'}}>일</span></h2>
                    <p style={styles.subText}>
                        올해 총 {totalAnnualLeave}일 | 사용 {usedAnnualLeave}일
                    </p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <p style={{margin: 0, fontSize: '13px', opacity: 0.8}}>직급 기준 연차</p>
                    <strong style={{display: 'block', fontSize: '18px', margin: '5px 0'}}>{totalAnnualLeave}일/년</strong>
                </div>
            </div>

            <div style={{marginTop: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px'}}>
                    <span>사용률</span>
                    <span>{usageRate}%</span>
                </div>
                <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${usageRate}%`}}></div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: 'linear-gradient(135deg, #254EDB 0%, #1A3BB0 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
    },
    infoWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    label: { fontSize: '14px', opacity: 0.8 },
    count: { fontSize: '42px', margin: '5px 0', fontWeight: 'bold' },
    subText: { fontSize: '13px', opacity: 0.7 },
    progressBar: {
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        transition: 'width 0.5s ease-out'
    }
};

export default LeaveBalanceCard;