// hai props để hứng response từ DTO của backend
import axiosInstance from "../../../config/axiosConfig.ts";
import {
    MonthlyRevenueResponse, ReconciliationClaimDTO,
    ReconciliationRequestCreateDTO,
    ReconciliationRequestResponse
} from "../types/revenue.types.ts";


class RevenueService {
    /**
     * Lấy đối soát doanh thu theo tháng
     * @param yearMonth - Format: "YYYY-MM" (VD: "2025-12")
     */
    async getMonthReconciliation(yearMonth: string): Promise<MonthlyRevenueResponse> {
        try {
            const response = await axiosInstance.get<MonthlyRevenueResponse>(
                    '/merchants/revenue-reconciliation/monthly',
                    {
                        params: {
                            yearMonth
                        }
                    }
                )
            ;
            return response.data;
        } catch (error) {
            console.error('Error fetching monthly reconciliation:', error);
            throw error;
        }
    }
    /**
     * Xuất báo cáo Excel (Future feature)
     */
    async exportToExcel(yearMonth: string): Promise<Blob> {
        try {
            const response = await axiosInstance.get(
                '/merchants/revenue-reconciliation/export',
                {
                    params: { yearMonth },
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }
    // --- MỚI: Gửi yêu cầu đối soát ---
    async createReconciliationRequest(data: ReconciliationRequestCreateDTO): Promise<ReconciliationRequestResponse> {
        try {
            const response = await axiosInstance.post<ReconciliationRequestResponse>(
                '/merchants/revenue-reconciliation/request',
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creating reconciliation request:', error);
            throw error;
        }
    }

    // --- MỚI: Lấy lịch sử ---
    async getHistory(): Promise<ReconciliationRequestResponse[]> {
        try {
            const response = await axiosInstance.get<ReconciliationRequestResponse[]>(
                '/merchants/revenue-reconciliation/history'
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    }

    async submitClaim(data: ReconciliationClaimDTO): Promise<ReconciliationRequestResponse> {
        try {
            const response = await axiosInstance.post<ReconciliationRequestResponse>(
                '/merchants/revenue-reconciliation/claim',
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting claim:', error);
            throw error;
        }
    }
}

export const revenueService = new RevenueService();