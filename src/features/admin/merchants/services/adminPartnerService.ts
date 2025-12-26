
import {PartnerRequestDto} from "../types/merchant.types.ts";
import axiosInstance from "../../../../config/axiosConfig.ts";

export const adminPartnerService = {
    // Lấy danh sách chờ duyệt
    getPendingRequests: async (): Promise<PartnerRequestDto[]> => {
        const response = await axiosInstance.get<PartnerRequestDto[]>('/admin/merchants/partner-requests');
        return response.data;
    },

    // Duyệt yêu cầu
    approveRequest: async (merchantId: number): Promise<{ message: string }> => {
        const response = await axiosInstance.put(`/admin/merchants/partner-requests/${merchantId}/approve`);
        return response.data;
    },

    // Từ chối yêu cầu
    rejectRequest: async (merchantId: number, reason: string): Promise<{ message: string }> => {
        const response = await axiosInstance.put(`/admin/merchants/partner-requests/${merchantId}/reject`, {
            reason
        });
        return response.data;
    }
};