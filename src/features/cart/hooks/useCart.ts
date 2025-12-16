// features/cart/hooks/useCart.ts

import { useState } from 'react';
import toast from 'react-hot-toast';
import { AddToCartRequest, CartApiService } from '../services/CartApi.service';
import { GuestCartHelper } from '../types/guestCart';

interface DishInfo {
    name: string;
    image: string;
    price: number;
    restaurantId?: number; // Cho phép optional
    restaurantName?: string; // Cho phép optional
}

export const useCart = () => {
    const [isLoading, setIsLoading] = useState(false);

    const addToCart = async (
        dishId: number,
        quantity: number,
        dishInfo?: DishInfo // Đã là optional rồi
    ) => {
        const token = localStorage.getItem('token');
        const isLoggedIn = Boolean(token);

        if (isLoggedIn) {
            // ... (Phần user đã login giữ nguyên, code của bạn đã đúng)
            setIsLoading(true);
            try {
                const request: AddToCartRequest = { dishId, quantity };
                await CartApiService.addToCart(request);
                toast.success('Đã thêm món vào giỏ hàng!');
                window.dispatchEvent(new Event('cartUpdated'));
            } catch (error) {
                console.error(error);
                toast.error('Lỗi khi thêm vào giỏ');
            } finally {
                setIsLoading(false);
            }
        } else {
            // ===== GUEST USER (SỬA ĐOẠN NÀY) =====
            try {
                // ✅ Thay bằng: Cứ thêm vào, thiếu info thì CartPage tự fetch sau
                GuestCartHelper.addItem(dishId, quantity, dishInfo);

                toast.success('Đã thêm vào giỏ hàng!', {
                    icon: '🛒'
                });

                window.dispatchEvent(new Event('cartUpdated'));

            } catch (e) {
                console.error('Lỗi lưu local storage:', e);
                toast.error('Không thể lưu vào giỏ hàng');
            }
        }
    };

    return { addToCart, isLoading };
};