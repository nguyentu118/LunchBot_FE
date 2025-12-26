// src/features/payment/services/paymentService.ts
// Service xử lý thanh toán SePay (MOCK MODE)

import axiosInstance from "../../../config/axiosConfig";

export interface SepayPaymentRequest {
    items: number[];           // dishIds
    addressId: number | null;
    amount: number;
    merchantName: string;
    userEmail: string;
    couponCode?: string;
    notes?: string;
    shippingFee: number;
}

export interface SepayPaymentResponse {
    success: boolean;
    paymentMethod: string;
    mode: string;
    txnRef: string;
    qrCodeUrl: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    amount: number;
    content: string;
}

export interface SepayCheckPaymentRequest {
    txnRef: string;
    amount: number;
}

export interface SepayCheckPaymentResponse {
    success: boolean;
    paid: boolean;
    orderId?: number;
    orderNumber?: string;
    message: string;
    mode?: string;
    transactionDetail?: any;
}

export const paymentService = {
    /**
     * Tạo QR thanh toán SePay
     * @param paymentData - Thông tin thanh toán
     * @returns Thông tin QR Code và payment
     */
    createSepayPayment: async (paymentData: SepayPaymentRequest): Promise<SepayPaymentResponse> => {
        try {
            console.log('📤 Creating SePay payment:', paymentData);

            // ✅ Sử dụng axiosInstance (đã có /api prefix)
            const response = await axiosInstance.post('/payment/sepay/create', paymentData);

            console.log('✅ SePay Payment Response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tạo thanh toán');
            }

            return response.data;

        } catch (error: any) {
            console.error("❌ Lỗi khi tạo thanh toán SePay:", error);

            // Xử lý lỗi chi tiết
            if (error.response) {
                const errorMsg = error.response.data?.message || 'Không thể tạo thanh toán SePay';
                throw new Error(errorMsg);
            } else if (error.request) {
                throw new Error('Không thể kết nối đến server thanh toán');
            } else {
                throw new Error('Có lỗi xảy ra khi tạo thanh toán');
            }
        }
    },

    /**
     * Kiểm tra trạng thái thanh toán
     * @param checkData - txnRef và amount
     */
    checkSepayPayment: async (checkData: SepayCheckPaymentRequest): Promise<SepayCheckPaymentResponse> => {
        try {
            console.log('🔍 Checking SePay payment:', checkData);

            // ✅ Sử dụng axiosInstance (đã có /api prefix)
            const response = await axiosInstance.post('/payment/sepay/check', checkData);

            console.log('✅ Check Payment Response:', response.data);

            return response.data;

        } catch (error: any) {
            console.error("❌ Lỗi khi check thanh toán:", error);

            // Trả về object thay vì throw error để tránh crash UI
            return {
                success: false,
                paid: false,
                message: error.response?.data?.message || error.message || 'Không thể kiểm tra thanh toán'
            };
        }
    },

    /**
     * 🎮 Manual trigger payment (chỉ dùng để demo nhanh)
     * @param txnRef - Transaction reference
     */
    triggerMockPayment: async (txnRef: string): Promise<void> => {
        try {
            console.log('⚡ Triggering mock payment:', txnRef);

            await axiosInstance.post(`/payment/sepay/mock/trigger/${txnRef}`);

            console.log('✅ Payment triggered successfully');

        } catch (error: any) {
            console.error("❌ Lỗi khi trigger payment:", error);
            throw new Error('Không thể trigger thanh toán');
        }
    }
};

export default paymentService;