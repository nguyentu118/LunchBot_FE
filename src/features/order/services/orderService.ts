// src/features/orders/services/orderService.ts

import axiosInstance from '../../../config/axiosConfig';
import {Order, CreateOrderRequest, CancelOrderRequest, OrderResponse} from '../types/order.types';

class OrderService {
    /**
     * Tạo đơn hàng mới
     */
    async createOrder(data: CreateOrderRequest): Promise<Order> {
        const response = await axiosInstance.post<Order>('/orders', data);
        return response.data;
    }
    /**
     * Lấy danh sách tất cả đơn hàng của user
     */
    async getAllOrders(): Promise<Order[]> {
        const response = await axiosInstance.get<Order[]>('/orders');
        return response.data;
    }

    /**
     * Lấy chi tiết một đơn hàng
     */
    async getOrderById(orderId: number): Promise<Order> {
        const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
        return response.data;
    }

    /**
     * Hủy đơn hàng
     */
    async cancelOrder(orderId: number, reason: string): Promise<Order> {
        const data: CancelOrderRequest = { reason };
        const response = await axiosInstance.put<Order>(`/orders/${orderId}/cancel`, data);
        return response.data;
    }
    /**
     * ========== ✅ THÊM CÁC METHOD MỚI CHO TASK 15 ==========
     * Thống kê đơn hàng theo món ăn - Dùng cho Merchant Dashboard
     */
    async getOrdersByDish(
        dishId: number,
        page: number = 0,
        size: number = 10
    ): Promise<{
        content: OrderResponse[];
        totalPages: number;
        totalElements: number;
        number: number;
        empty: boolean;
    }> {
        try {
            const response = await axiosInstance.get(
                `/merchants/orders/by-dish/${dishId}`,
                {
                    params: {
                        page,
                        size
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching orders for dish ${dishId}:`, error);
            throw error;
        }
    }

    /**
     * ✅ Task 15: Lấy danh sách các món ăn của merchant hiện tại
     * (Để dùng cho dropdown chọn món ăn)
     */
    async getMerchantDishes(): Promise<any> {
        try {
            const response = await axiosInstance.get('/dishes/list');
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching merchant dishes:', error);
            throw error;
        }
    }
}

export const orderService = new OrderService();