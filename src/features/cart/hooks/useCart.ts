// ✅ SỬA: Validate món còn available trước khi thêm vào giỏ

import { useState } from 'react';
import toast from 'react-hot-toast';
import { AddToCartRequest, CartApiService } from '../services/CartApi.service';
import { GuestCartHelper } from '../types/guestCart';
import axiosInstance from '../../../config/axiosConfig';

interface DishInfo {
    name: string;
    image: string;
    price: number;
    restaurantId?: number;
    restaurantName?: string;
}

export const useCart = () => {
    const [isLoading, setIsLoading] = useState(false);

    const addToCart = async (
        dishId: number,
        quantity: number,
        dishInfo?: DishInfo
    ) => {
        const token = localStorage.getItem('token');
        const isLoggedIn = Boolean(token);

        setIsLoading(true);

        try {
            // ✅ THÊM: Validate món còn available không
            try {
                await axiosInstance.get(`/dishes/${dishId}`);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    toast.error('Món ăn này không còn khả dụng', { duration: 4000 });
                    return;
                }
                // Lỗi khác (500, network) vẫn cho phép thêm (có thể là tạm thời)
                console.warn('Warning: Could not validate dish availability:', err);
            }

            if (isLoggedIn) {
                // User đã login - gọi API
                const request: AddToCartRequest = { dishId, quantity };
                await CartApiService.addToCart(request);
                toast.success('Đã thêm món vào giỏ hàng!');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                // Guest user - lưu local
                GuestCartHelper.addItem(dishId, quantity, dishInfo);
                toast.success('Đã thêm vào giỏ hàng!', { icon: '🛒' });
                window.dispatchEvent(new Event('cartUpdated'));
            }

        } catch (error: any) {
            console.error('Error adding to cart:', error);

            // Xử lý lỗi cụ thể từ Backend
            const errorMsg = error.response?.data?.error || 'Lỗi khi thêm vào giỏ';
            toast.error(errorMsg);

        } finally {
            setIsLoading(false);
        }
    };

    return { addToCart, isLoading };
};