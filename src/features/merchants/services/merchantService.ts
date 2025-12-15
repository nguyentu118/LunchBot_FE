// src/services/merchantService.ts

import axiosInstance from '../../../config/axiosConfig';
import { PopularMerchantDto } from '../types/merchant';

export const merchantService = {
    /**
     * Lấy danh sách nhà hàng nổi tiếng
     * @param limit - Số lượng merchants cần lấy (mặc định 8)
     */
    getPopularMerchants: async (limit: number = 8): Promise<PopularMerchantDto[]> => {
        try {
            const response = await axiosInstance.get<PopularMerchantDto[]>(
                `/merchants/popular`,
                {
                    params: { limit }
                }
            );
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching popular merchants:', error);
            throw error;
        }
    }
};