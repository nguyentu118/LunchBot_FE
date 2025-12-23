// src/features/orders/services/orderService.ts

import axiosInstance from '../../../config/axiosConfig';
import {
    Order,
    CreateOrderRequest,
    CancelOrderRequest,
    OrderResponse,
    UserResponseDTO,
    CouponStatisticsResponse
} from '../types/order.types';

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

    /**
     *Lấy danh sách khách hàng của merchant
     */
    async getCustomersByMerchant(): Promise<UserResponseDTO[]> {
        try {
            const response = await axiosInstance.get<UserResponseDTO[]>('/merchants/my-customers');
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching customers:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách đơn hàng của một khách hàng cụ thể
     */
    async getOrdersByCustomerForMerchant(customerId: number): Promise<OrderResponse[]> {
        try {
            const response = await axiosInstance.get<OrderResponse[]>(
                `/merchants/customers/${customerId}/orders`
            );
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching orders for customer ${customerId}:`, error);
            throw error;
        }
    }
    // Thêm vào class OrderService trong orderService.ts
    async getCouponStatistics(couponId: number): Promise<CouponStatisticsResponse> {
        try {
            const response = await axiosInstance.get<CouponStatisticsResponse>(
                `/merchants/coupons/${couponId}/statistics`
            );
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching coupon stats for ID ${couponId}:`, error);
            throw error;
        }
    }

// Cần thêm hàm lấy danh sách Coupon để đổ vào Dropdown nếu chưa có
    async getMerchantCoupons(): Promise<any[]> {
        try {
            const response = await axiosInstance.get('/merchants/my-coupons');
            console.log('📦 Raw response from /merchants/my-coupons:', response.data);

            const coupons = response.data;

            // ✅ Nếu response là array, trả về trực tiếp
            if (Array.isArray(coupons)) {
                console.log('✅ Response is array, returning:', coupons);
                return coupons;
            }

            // ✅ Nếu response là object, tìm array bên trong
            if (coupons && typeof coupons === 'object') {
                // Kiểm tra các property phổ biến chứa array
                const arrayKeys = ['data', 'content', 'coupons', 'list', 'items'];
                for (const key of arrayKeys) {
                    if (Array.isArray(coupons[key])) {
                        console.log(`✅ Found array in coupons.${key}:`, coupons[key]);
                        return coupons[key];
                    }
                }

                // ✅ Nếu không có array, convert object thành array
                console.warn('⚠️ Response is object but no array found, converting to array');
                return [coupons];
            }

            // ✅ Fallback: trả về empty array
            console.warn('⚠️ Unexpected response format:', coupons);
            return [];
        } catch (error) {
            console.error('❌ Error fetching merchant coupons:', error);
            throw error;
        }
    }
}

export const orderService = new OrderService();