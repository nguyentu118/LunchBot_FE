// src/features/order/services/orderService.ts

import axiosInstance from '../../../config/axiosConfig';
import { OrderResponse } from '../types/order.types';
import { CheckoutRequest } from '../types/checkout.types';

const API_PREFIX = '/orders';

/**
 * Order Service - Quản lý đơn hàng
 */
export const orderService = {
    /**
     * Tạo đơn hàng mới từ giỏ hàng
     * @param data - Thông tin checkout (addressId, paymentMethod, couponCode, notes)
     * @returns Order đã tạo
     */
    createOrder: async (data: CheckoutRequest): Promise<OrderResponse> => {
        const response = await axiosInstance.post<OrderResponse>(API_PREFIX, data);
        return response.data;
    },

    /**
     * Lấy danh sách tất cả đơn hàng của user
     * @returns Danh sách orders (sắp xếp mới nhất trước)
     */
    getOrders: async (): Promise<OrderResponse[]> => {
        const response = await axiosInstance.get<OrderResponse[]>(API_PREFIX);
        return response.data;
    },

    /**
     * Lấy chi tiết một đơn hàng
     * @param orderId - ID đơn hàng
     */
    getOrderById: async (orderId: number): Promise<OrderResponse> => {
        const response = await axiosInstance.get<OrderResponse>(`${API_PREFIX}/${orderId}`);
        return response.data;
    },

    /**
     * Hủy đơn hàng
     * @param orderId - ID đơn hàng
     * @param reason - Lý do hủy
     */
    cancelOrder: async (orderId: number, reason: string): Promise<OrderResponse> => {
        const response = await axiosInstance.put<OrderResponse>(
            `${API_PREFIX}/${orderId}/cancel`,
            { reason }
        );
        return response.data;
    }
};