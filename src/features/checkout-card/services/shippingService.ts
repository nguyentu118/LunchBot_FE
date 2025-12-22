// src/features/shipping/services/shippingService.ts

import axiosInstance from '../../../config/axiosConfig';

const API_PREFIX = '/shipping';

/**
 * Shipping Service - Quản lý phí giao hàng
 */
export const shippingService = {
    /**
     * Tính phí giao hàng dựa vào địa chỉ
     * @param addressId - ID của địa chỉ giao hàng
     * @returns Số tiền phí giao hàng (VND)
     */
    calculateShippingFee: async (addressId: number): Promise<number> => {
        try {
            const response = await axiosInstance.get<number>(
                `${API_PREFIX}/calculate-fee`,
                {
                    params: { addressId }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error calculating shipping fee:', error);
            throw new Error(
                error.response?.data?.error ||
                'Không thể tính phí giao hàng. Vui lòng thử lại.'
            );
        }
    },

    /**
     * Tính phí giao hàng với fallback nếu GHN API fail
     * @param addressId - ID của địa chỉ giao hàng
     * @param fallbackFee - Phí mặc định nếu tính toán thất bại (VD: 25000)
     * @returns Số tiền phí giao hàng
     */
    calculateShippingFeeWithFallback: async (
        addressId: number,
        fallbackFee: number = 25000
    ): Promise<{ fee: number; isCalculated: boolean }> => {
        try {
            const fee = await shippingService.calculateShippingFee(addressId);
            return { fee, isCalculated: true };
        } catch (error) {
            console.warn('Failed to calculate shipping fee, using fallback:', fallbackFee);
            return { fee: fallbackFee, isCalculated: false };
        }
    }
};