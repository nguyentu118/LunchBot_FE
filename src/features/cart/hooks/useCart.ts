// features/cart/hooks/useCart.ts (WITH CACHE)

import { useState } from 'react';
import toast from 'react-hot-toast';
import { AddToCartRequest, CartApiService } from '../services/CartApi.service';
import { GuestCartHelper } from '../types/guestCart';

// 🔥 Thêm interface cho thông tin món
interface DishInfo {
    name: string;
    image: string;
    price: number;
}

export const useCart = () => {
    const [isLoading, setIsLoading] = useState(false);

    // 🔥 Cập nhật hàm addToCart để nhận thêm dishInfo
    const addToCart = async (
        dishId: number,
        quantity: number,
        dishInfo?: DishInfo // Thông tin món để cache
    ) => {
        const token = localStorage.getItem('token');
        const isLoggedIn = Boolean(token);

        if (isLoggedIn) {
            // ===== LOGGED IN USER =====
            setIsLoading(true);
            try {
                const request: AddToCartRequest = { dishId, quantity };
                await CartApiService.addToCart(request);

                toast.success('Đã thêm món vào giỏ hàng!', {
                    duration: 2000,
                    position: 'top-center',
                    icon: '🛒',
                });

                window.dispatchEvent(new Event('cartUpdated'));

            } catch (error) {
                console.error('Error adding to cart:', error);
                toast.error('Thêm vào giỏ thất bại. Vui lòng thử lại.', {
                    duration: 3000,
                    position: 'top-center',
                });
            } finally {
                setIsLoading(false);
            }

        } else {
            // ===== GUEST USER =====
            try {
                // 🔥 Sử dụng GuestCartHelper với cache
                GuestCartHelper.addItem(dishId, quantity, dishInfo);

                toast.success('Đã thêm vào giỏ hàng!', {
                    duration: 2000,
                    position: 'top-center',
                    icon: '🛒',
                });

                window.dispatchEvent(new Event('cartUpdated'));

            } catch (e) {
                console.error('Lỗi lưu local storage:', e);
                toast.error('Không thể lưu vào giỏ hàng', {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        }
    };

    return {
        addToCart,
        isLoading
    };
};