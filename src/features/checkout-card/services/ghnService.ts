// src/features/address/services/ghnService.ts

import axiosInstance from '../../../config/axiosConfig';
import { GHNProvince, GHNDistrict, GHNWard } from '../types/address.types';

const API_PREFIX = '/ghn';

/**
 * GHN Service - Lấy danh sách tỉnh/quận/phường từ GHN API
 */
export const ghnService = {
    /**
     * Lấy danh sách tất cả tỉnh/thành phố
     */
    getProvinces: async (): Promise<GHNProvince[]> => {
        try {
            const response = await axiosInstance.get<GHNProvince[]>(
                `${API_PREFIX}/provinces`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching provinces:', error);
            throw new Error('Không thể tải danh sách tỉnh/thành phố');
        }
    },

    /**
     * Lấy danh sách quận/huyện theo tỉnh
     * @param provinceId - ID tỉnh từ GHN
     */
    getDistrictsByProvince: async (provinceId: number): Promise<GHNDistrict[]> => {
        try {
            const response = await axiosInstance.get<GHNDistrict[]>(
                `${API_PREFIX}/districts`,
                {
                    params: { provinceId }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching districts:', error);
            throw new Error('Không thể tải danh sách quận/huyện');
        }
    },

    /**
     * Lấy danh sách phường/xã theo quận
     * @param districtId - ID quận từ GHN
     */
    getWardsByDistrict: async (districtId: number): Promise<GHNWard[]> => {
        try {
            const response = await axiosInstance.get<GHNWard[]>(
                `${API_PREFIX}/wards`,
                {
                    params: { districtId }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching wards:', error);
            throw new Error('Không thể tải danh sách phường/xã');
        }
    },

    /**
     * Lấy thông tin chi tiết một quận
     */
    getDistrictById: async (districtId: number): Promise<GHNDistrict> => {
        try {
            const response = await axiosInstance.get<GHNDistrict>(
                `${API_PREFIX}/districts/${districtId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching district:', error);
            throw new Error('Không thể tải thông tin quận');
        }
    },

    /**
     * Lấy thông tin chi tiết một phường
     */
    getWardByCode: async (wardCode: string): Promise<GHNWard> => {
        try {
            const response = await axiosInstance.get<GHNWard>(
                `${API_PREFIX}/wards/${wardCode}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching ward:', error);
            throw new Error('Không thể tải thông tin phường');
        }
    }
};