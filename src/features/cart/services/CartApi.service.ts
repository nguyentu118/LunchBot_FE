// src/features/cart/services/CartApi.service.ts

import axiosInstance from '../../../config/axiosConfig';
import { CartCountDTO } from '../../user/types/user.type';

// ⭐ BỎ /api ở đầu
const CART_API = '/cart';

export const CartApiService = {
    /**
     * Lấy số lượng món ăn trong Giỏ hàng
     */
    getCartCount: async (): Promise<CartCountDTO> => {
        try {
            const response = await axiosInstance.get(`${CART_API}/count`);
            console.log('✅ Cart API Response:', response.data);

            // ⭐ Kiểm tra response structure
            if (response.data.data) {
                return response.data.data;
            }

            return response.data;
        } catch (error) {
            console.error("❌ Failed to fetch cart count:", error);
            throw error; // ⭐ Throw error thay vì return default
        }
    },
};