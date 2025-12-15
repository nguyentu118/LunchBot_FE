// File: src/services/DishService.ts

import api from '../../../config/axiosConfig'; // Tái sử dụng axiosConfig.ts
import { DishDiscount } from '../types/DishDiscount';
import { SuggestedDish } from '../types/suggestedDish'; // Tái sử dụng type cũ nếu cần

const DISH_BASE_URL = '/dishes';

/**
 * [Task 41] Lấy danh sách 8 món ăn có % giảm giá nhiều nhất.
 * @returns Promise<DishDiscount[]>
 */
export const getTopDiscountedDishes = async (): Promise<DishDiscount[]> => {
    try {
        const response = await api.get<DishDiscount[]>(`${DISH_BASE_URL}/top-discounts`);
        return response.data;
    } catch (error) {
        // Log lỗi hoặc throw lỗi để component xử lý
        console.error("Error fetching top discounted dishes:", error);
        throw error;
    }
};

/**
 * [Task cũ] Lấy danh sách 8 món ăn gợi ý
 * @returns Promise<SuggestedDish[]>
 */
export const getSuggestedDishes = async (): Promise<SuggestedDish[]> => {
    try {
        const response = await api.get<SuggestedDish[]>(`${DISH_BASE_URL}/suggested`);
        return response.data;
    } catch (error) {
        console.error("Error fetching suggested dishes:", error);
        throw error;
    }
};

// ... Thêm các function API liên quan đến Dish khác tại đây ...