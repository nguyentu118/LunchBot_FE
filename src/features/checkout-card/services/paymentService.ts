// src/features/payment/services/paymentService.ts
// Service xử lý thanh toán VNPay

import axiosInstance from "../../../config/axiosConfig";

export const paymentService = {
    /**
     * Tạo URL thanh toán VNPay
     * @param amount - Số tiền cần thanh toán (VND)
     * @param orderDescription - Mô tả đơn hàng
     * @returns URL thanh toán VNPay
     */
    createVNPayPayment: async (amount: number, orderDescription: string): Promise<string> => {
        try {
            const response = await axiosInstance.get(`/payment/create-payment`, {
                params: {
                    amount: amount,
                    orderInfo: orderDescription
                }
            });

            // Backend trả về object: { paymentUrl: "https://..." }
            const paymentUrl = response.data.paymentUrl || response.data;

            console.log('✅ VNPay Payment URL:', paymentUrl);

            return paymentUrl;
        } catch (error: any) {
            console.error("❌ Lỗi khi tạo thanh toán VNPay:", error);

            // Xử lý lỗi chi tiết
            if (error.response) {
                throw new Error(error.response.data?.error || 'Không thể tạo thanh toán VNPay');
            } else if (error.request) {
                throw new Error('Không thể kết nối đến server thanh toán');
            } else {
                throw new Error('Có lỗi xảy ra khi tạo thanh toán');
            }
        }
    },

    /**
     * Xác minh callback từ VNPay (optional - có thể xử lý ở backend)
     * @param queryParams - Query parameters từ VNPay callback
     */
    verifyVNPayCallback: async (queryParams: Record<string, string>) => {
        try {
            const response = await axiosInstance.post(`/payment/vnpay/callback`, queryParams);
            return response.data;
        } catch (error: any) {
            console.error("❌ Lỗi khi xác minh callback VNPay:", error);
            throw error;
        }
    }
};

export default paymentService;