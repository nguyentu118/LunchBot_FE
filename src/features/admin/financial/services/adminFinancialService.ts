import axiosInstance from "../../../../config/axiosConfig";
import {AdminWithdrawalRequest} from "../types/adminFinancial.types.ts";

export const adminFinancialService = {
    // 1. Lấy danh sách yêu cầu (mặc định lấy PENDING)
    getRequests: async (status: string = 'PENDING'): Promise<AdminWithdrawalRequest[]> => {
        const response = await axiosInstance.get<AdminWithdrawalRequest[]>('/admin/financial/withdrawals', {
            params: { status }
        });
        return response.data;
    },

    // 2. Duyệt yêu cầu
    approveRequest: async (id: number): Promise<void> => {
        await axiosInstance.put(`/admin/financial/withdrawals/${id}/approve`);
    },

    // 3. Từ chối yêu cầu
    rejectRequest: async (id: number, reason: string): Promise<void> => {
        await axiosInstance.put(`/admin/financial/withdrawals/${id}/reject`, { reason });
    }
};