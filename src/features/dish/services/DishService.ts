// File: src/services/DishService.ts

import api from '../../../config/axiosConfig'; // Tái sử dụng axiosConfig.ts
import { DishDiscount } from '../types/DishDiscount';
import { SuggestedDish } from '../types/suggestedDish';
import {DishSearchRequest, DishSearchResponse, PageResponse} from "../types/dish.types.ts";

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

export const searchDishes = async (request: DishSearchRequest): Promise<PageResponse<DishSearchResponse>> => {
    console.log('🌐 API CALL - searchDishes', request);

    try {
        const params = new URLSearchParams();

        if (request.name) params.append('name', request.name);
        if (request.categoryName) params.append('categoryName', request.categoryName);
        if (request.minPrice) params.append('minPrice', request.minPrice.toString());
        if (request.maxPrice) params.append('maxPrice', request.maxPrice.toString());
        if (request.isRecommended !== undefined) params.append('isRecommended', request.isRecommended.toString());
        params.append('page', (request.page || 0).toString());
        params.append('size', (request.size || 12).toString());

        console.log('🔗 URL:', `${DISH_BASE_URL}/search?${params.toString()}`);

        const response = await api.get<PageResponse<DishSearchResponse>>(
            `${DISH_BASE_URL}/search?${params.toString()}`
        );

        console.log('✅ API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error searching dishes:", error);
        throw error;
    }
};

// Export object để dễ sử dụng
export const dishService = {
    getTopDiscountedDishes,
    getSuggestedDishes,
    searchDishes
};