// src/features/admin/refund/services/RefundApi.service.ts

import axiosInstance from '../../../../config/axiosConfig';

const REFUND_API = '/admin/refunds';

export type RefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface RefundResponse {
    id: number;
    orderId: number;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    refundAmount: number;
    customerBankAccount: string;
    customerBankName: string;
    customerAccountName: string;
    refundStatus: RefundStatus;
    refundReason: string;
    transactionRef: string;
    refundTransactionRef: string | null;
    createdAt: string;
    processedAt: string | null;
    processedBy: string | null;
    notes: string | null;
}

export interface ConfirmRefundPayload {
    refundTransactionRef: string;
    notes: string;
}

export const RefundApiService = {
    /**
     * Lấy danh sách yêu cầu hoàn tiền chờ xử lý
     * GET /api/admin/refunds/pending
     */
    getPendingRefunds: async (): Promise<RefundResponse[]> => {
        try {
            const response = await axiosInstance.get(`${REFUND_API}/pending`);
            if (response.data.success) {
                return response.data.data || [];
            }
            throw new Error(response.data.message || 'Lỗi lấy danh sách hoàn tiền');
        } catch (error) {
            console.error('❌ Failed to fetch pending refunds:', error);
            throw error;
        }
    },

    /**
     * Lấy tất cả yêu cầu hoàn tiền (có thể filter theo status)
     * GET /api/admin/refunds?status={status}
     */
    getAllRefunds: async (status?: RefundStatus): Promise<RefundResponse[]> => {
        try {
            const url = status
                ? `${REFUND_API}?status=${status}`
                : REFUND_API;

            const response = await axiosInstance.get(url);
            if (response.data.success) {
                return response.data.data || [];
            }
            throw new Error(response.data.message || 'Lỗi lấy danh sách hoàn tiền');
        } catch (error) {
            console.error('❌ Failed to fetch all refunds:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết yêu cầu hoàn tiền
     * GET /api/admin/refunds/{refundId}
     */
    getRefundDetail: async (refundId: number): Promise<RefundResponse> => {
        try {
            const response = await axiosInstance.get(`${REFUND_API}/${refundId}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Lỗi lấy chi tiết hoàn tiền');
        } catch (error) {
            console.error('❌ Failed to fetch refund detail:', error);
            throw error;
        }
    },

    /**
     * ✅ THÊM: Chuyển sang trạng thái PROCESSING
     * POST /api/admin/refunds/{refundId}/processing
     */
    markAsProcessing: async (refundId: number, notes?: string): Promise<void> => {
        try {
            const response = await axiosInstance.post(
                `${REFUND_API}/${refundId}/processing`,
                { notes }
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi chuyển trạng thái PROCESSING');
            }
        } catch (error) {
            console.error('❌ Failed to mark as processing:', error);
            throw error;
        }
    },

    /**
     * Admin xác nhận đã hoàn tiền thủ công (COMPLETED)
     * POST /api/admin/refunds/{refundId}/confirm
     */
    confirmRefund: async (
        refundId: number,
        payload: ConfirmRefundPayload
    ): Promise<void> => {
        try {
            const response = await axiosInstance.post(
                `${REFUND_API}/${refundId}/confirm`,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi xác nhận hoàn tiền');
            }
        } catch (error) {
            console.error('❌ Failed to confirm refund:', error);
            throw error;
        }
    },

    /**
     * ✅ THÊM: Đánh dấu hoàn tiền thất bại (FAILED)
     * POST /api/admin/refunds/{refundId}/fail
     */
    markAsFailed: async (refundId: number, reason: string): Promise<void> => {
        try {
            const response = await axiosInstance.post(
                `${REFUND_API}/${refundId}/fail`,
                { reason }
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi đánh dấu thất bại');
            }
        } catch (error) {
            console.error('❌ Failed to mark as failed:', error);
            throw error;
        }
    },

    /**
     * ✅ THÊM: Hủy yêu cầu hoàn tiền (CANCELLED)
     * POST /api/admin/refunds/{refundId}/cancel
     */
    cancelRefund: async (refundId: number, reason: string): Promise<void> => {
        try {
            const response = await axiosInstance.post(
                `${REFUND_API}/${refundId}/cancel`,
                { reason }
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi hủy yêu cầu hoàn tiền');
            }
        } catch (error) {
            console.error('❌ Failed to cancel refund:', error);
            throw error;
        }
    },

    /**
     * ✅ THÊM: Retry refund từ FAILED
     * POST /api/admin/refunds/{refundId}/retry
     */
    retryRefund: async (refundId: number): Promise<void> => {
        try {
            const response = await axiosInstance.post(
                `${REFUND_API}/${refundId}/retry`,
                {}
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi retry refund');
            }
        } catch (error) {
            console.error('❌ Failed to retry refund:', error);
            throw error;
        }
    },
};