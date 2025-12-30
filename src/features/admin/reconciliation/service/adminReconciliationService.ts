import axiosInstance from "../../../../config/axiosConfig";

// Copy Type từ Merchant services sang hoặc import nếu có file shared types
export interface AdminReconciliationRequestResponse {
    id: number;
    merchantId: number;
    merchantName: string;
    yearMonth: string;
    totalOrders: number;
    totalGrossRevenue: number;
    netRevenue: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED'| 'REPORTED';
    statusDisplay: string;
    merchantNotes?: string;
    adminNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    reviewedByName?: string;
}

export interface ReconciliationReviewDTO {
    rejectionReason: string;
    adminNotes?: string;
}

class AdminReconciliationService {

    // 1. Lấy danh sách (có phân trang & lọc status)
    async getAllRequests(status?: string, page: number = 0, size: number = 10) {
        const params: any = {page, size};
        if (status) params.status = status;

        const response = await axiosInstance.get<{
            content: AdminReconciliationRequestResponse[];
            totalPages: number;
            totalElements: number;
        }>('/admin/reconciliation/requests', {params});

        return response.data;
    }

    // 2. Duyệt yêu cầu
    async approveRequest(id: number) {
        const response = await axiosInstance.put<AdminReconciliationRequestResponse>(
            `/admin/reconciliation/requests/${id}/approve`
        );
        return response.data;
    }

    // 3. Từ chối yêu cầu
    async rejectRequest(id: number, data: ReconciliationReviewDTO) {
        const response = await axiosInstance.put<AdminReconciliationRequestResponse>(
            `/admin/reconciliation/requests/${id}/reject`,
            data
        );
        return response.data;
    }

    async downloadClaimFile(requestId: number): Promise<Blob> {
        try {
            const response = await axiosInstance.get(
                `/admin/reconciliation/${requestId}/claim-file/download`,
                {
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error downloading claim file:', error);
            throw error;
        }
    }
}
export const adminReconciliationService = new AdminReconciliationService();