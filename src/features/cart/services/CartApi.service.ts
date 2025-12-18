import axiosInstance from '../../../config/axiosConfig';
import { CartCountDTO } from '../../user/types/user.type';
import {CartResponse} from "../types/cart.ts";
import { GuestCartHelper } from '../types/guestCart';

// ⭐ BỎ /api ở đầu
const CART_API = '/cart';

export interface AddToCartRequest {
    dishId: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export const CartApiService = {
    getCartCount: async (): Promise<CartCountDTO> => {
        try {
            const response = await axiosInstance.get(`${CART_API}/count`);

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

    addToCart: async (data: AddToCartRequest): Promise<AddToCartRequest> => {
        try {
            // Gửi dishId và quantity lên server
            const response = await axiosInstance.post(`${CART_API}/add`, data);
            console.log('✅ Add to cart success:', response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Failed to add to cart:", error);
            throw error;
        }
    },

    getCart: async (): Promise<CartResponse> => {
        try {
            const response = await axiosInstance.get(`${CART_API}`);
            console.log('✅ Cart Data Response:', response.data);

            // Backend có thể trả về dạng: { data: {...} } hoặc trực tiếp {...}
            if (response.data.data) {
                return response.data.data;
            }

            return response.data;
        } catch (error) {
            console.error("❌ Failed to fetch cart:", error);
            throw error;
        }
    },

    updateCartItem: async (dishId: number, quantity: number): Promise<void> => {
        try {
            const requestData: UpdateCartItemRequest = { quantity };
            const response = await axiosInstance.put(
                `${CART_API}/update/${dishId}`,
                requestData
            );
            console.log('✅ Update cart item success:', response.data);
        } catch (error) {
            console.error("❌ Failed to update cart item:", error);
            throw error;
        }
    },

    removeFromCart: async (dishId: number): Promise<void> => {
        try {
            const response = await axiosInstance.delete(`${CART_API}/remove/${dishId}`);
            console.log('✅ Remove from cart success:', response.data);
        } catch (error) {
            console.error("❌ Failed to remove from cart:", error);
            throw error;
        }
    },

    clearCart: async (): Promise<void> => {
        try {
            const response = await axiosInstance.delete(`${CART_API}/clear`);
            console.log('✅ Clear cart success:', response.data);
        } catch (error) {
            console.error("❌ Failed to clear cart:", error);
            throw error;
        }
    },

    syncGuestCart: async () => {
        // 1. Lấy dữ liệu giỏ hàng guest đã chuẩn hóa (chỉ lấy dishId và quantity)
        const guestItems = GuestCartHelper.prepareForSync();

        if (guestItems.length === 0) return; // Nếu giỏ hàng trống thì thôi

        try {
            // 2. Chạy vòng lặp gửi từng món lên server
            // (Dùng Promise.all để gửi đồng thời cho nhanh)
            const promises = guestItems.map(item =>
                CartApiService.addToCart({
                    dishId: item.dishId,
                    quantity: item.quantity
                })
            );

            await Promise.all(promises);

            // 3. Sau khi gửi thành công hết thì XÓA LocalStorage đi
            localStorage.removeItem('GUEST_CART');

            console.log('Đã đồng bộ giỏ hàng thành công!');
        } catch (error) {
            console.error('Lỗi khi đồng bộ giỏ hàng:', error);
            // Có thể giữ lại LocalStorage để user thử lại sau nếu muốn
        }
    }
};