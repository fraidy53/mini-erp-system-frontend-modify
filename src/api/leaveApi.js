import axiosInstance from "./axiosInstance";

export class leaveApi {
    #base = '/leave';

    //잔여 연차 조회
    async getBalance() { 
        const { data } = await axiosInstance.get(`${this.#base}/balance`);
        return data;
    }

    //직급별 연차 기준 조회
    async getPolicy() {
        const { data } = await axiosInstance.get(`${this.#base}/policy`);
        return data;
    }
    
    //연차 신청 (leaveData: {appType, startDate, endDate, requestReason}) 
    async createRequest(leaveData) {
        const { data } = await axiosInstance.post(`${this.#base}`, leaveData);
        return data;
    }
    
    //신청 내역 조회
    async getMyRequests() {
        const { data } = await axiosInstance.get(`${this.#base}/my`);
        return data;
    }
}
