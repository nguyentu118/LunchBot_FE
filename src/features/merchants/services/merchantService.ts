// src/services/merchantService.ts

import axiosInstance from '../../../config/axiosConfig';
import {PopularMerchantDto, RevenueStatisticsResponse} from '../types/merchant';

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
    },

    getRevenueStatistics: async (
        merchantId: number,
        params: {
            timeRange?: string;
            week?: number;
            month?: number;
            quarter?: number;
            year?: number;
            page?: number;
            size?: number;
        } = {}
    ): Promise<RevenueStatisticsResponse> => {
        try {
            // ✅ SET DEFAULT VALUES
            const queryParams = {
                timeRange: params.timeRange || 'MONTH',
                page: params.page ?? 0,
                size: params.size ?? 10,
                ...(params.week !== undefined && { week: params.week }),
                ...(params.month !== undefined && { month: params.month }),
                ...(params.quarter !== undefined && { quarter: params.quarter }),
                ...(params.year !== undefined && { year: params.year }),
            };

            const response = await axiosInstance.get<RevenueStatisticsResponse>(
                `/merchants/${merchantId}/statistics/revenue`,
                { params: queryParams }
            );
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching statistics:', error);
            throw error;
        }
    }
};