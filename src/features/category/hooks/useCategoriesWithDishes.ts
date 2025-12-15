import { useState, useEffect } from 'react';
import axiosInstance from "../../../config/axiosConfig.ts";
import { AxiosResponse, AxiosError } from 'axios';

/**
 * Interface cho Category với thông tin dishes
 * Khớp với CategoryDto từ Backend
 */
export interface CategoryWithDishes {
    id: number;
    name: string;
    iconUrl: string;
    restaurantCount: number;
}

interface UseCategoriesWithDishesResult {
    categories: CategoryWithDishes[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Custom Hook để fetch danh sách Category kèm số lượng nhà hàng
 * Endpoint: GET /api/categories/with-dishes
 */
const useCategoriesWithDishes = (): UseCategoriesWithDishesResult => {
    const [categories, setCategories] = useState<CategoryWithDishes[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);

        try {
            // Gọi API endpoint /categories/with-dishes
            const response: AxiosResponse<CategoryWithDishes[]> = await axiosInstance.get('/categories/with-dishes');

            console.log('✅ Categories fetched successfully:', response.data);
            setCategories(response.data || []);

        } catch (error) {
            console.error('❌ Error fetching categories with dishes:', error);

            const axiosError = error as AxiosError;
            let errorMessage = 'Không thể tải danh sách danh mục. Vui lòng thử lại sau.';

            if (axiosError.response) {
                switch (axiosError.response.status) {
                    case 403:
                        errorMessage = 'Lỗi bảo mật (403): Vui lòng kiểm tra cấu hình Spring Security.';
                        break;
                    case 404:
                        errorMessage = 'Không tìm thấy endpoint API (404).';
                        break;
                    case 500:
                        errorMessage = 'Lỗi máy chủ (500): Vui lòng liên hệ quản trị viên.';
                        break;
                    case 204:
                        errorMessage = 'Chưa có danh mục nào trong hệ thống.';
                        setCategories([]);
                        break;
                    default:
                        errorMessage = `Lỗi ${axiosError.response.status}: ${axiosError.message}`;
                }
            } else if (axiosError.request) {
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
            }

            setError(errorMessage);
            setCategories([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Hàm refetch để gọi lại API khi cần
    const refetch = () => {
        fetchCategories();
    };

    return {
        categories,
        loading,
        error,
        refetch
    };
};

export default useCategoriesWithDishes;