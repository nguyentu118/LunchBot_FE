// src/features/orders/services/orderService.ts

import axiosInstance from '../../../config/axiosConfig';
import { Order, CreateOrderRequest, CancelOrderRequest } from '../types/order.types';

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
}

export const orderService = new OrderService();