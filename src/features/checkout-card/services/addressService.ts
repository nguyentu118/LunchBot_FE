// src/features/address/services/addressService.ts

import axiosInstance from '../../../config/axiosConfig';
import { Address, AddressRequest } from '../types/address.types';

const API_PREFIX = '/addresses';

/**
 * Address Service - Quản lý địa chỉ giao hàng
 */
export const addressService = {
    /**
     * Lấy tất cả địa chỉ của user
     */
    getAllAddresses: async (): Promise<Address[]> => {
        const response = await axiosInstance.get<Address[]>(API_PREFIX);
        return response.data;
    },

    /**
     * Lấy thông tin một địa chỉ cụ thể
     */
    getAddressById: async (addressId: number): Promise<Address> => {
        const response = await axiosInstance.get<Address>(`${API_PREFIX}/${addressId}`);
        return response.data;
    },

    /**
     * Lấy địa chỉ mặc định
     */
    getDefaultAddress: async (): Promise<Address | null> => {
        try {
            const response = await axiosInstance.get<Address>(`${API_PREFIX}/default`);
            return response.data;
        } catch (error: any) {
            // Nếu chưa có địa chỉ mặc định, API trả về 404
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Tạo địa chỉ mới
     */
    createAddress: async (data: AddressRequest): Promise<Address> => {
        const response = await axiosInstance.post<Address>(API_PREFIX, data);
        return response.data;
    },

    /**
     * Cập nhật địa chỉ
     */
    updateAddress: async (addressId: number, data: AddressRequest): Promise<Address> => {
        const response = await axiosInstance.put<Address>(`${API_PREFIX}/${addressId}`, data);
        return response.data;
    },

    /**
     * Xóa địa chỉ
     */
    deleteAddress: async (addressId: number): Promise<void> => {
        await axiosInstance.delete(`${API_PREFIX}/${addressId}`);
    },

    /**
     * Đặt địa chỉ làm mặc định
     */
    setDefaultAddress: async (addressId: number): Promise<Address> => {
        const response = await axiosInstance.put<Address>(`${API_PREFIX}/${addressId}/default`);
        return response.data;
    }
};