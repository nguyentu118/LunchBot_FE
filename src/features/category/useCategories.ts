import { useState, useEffect } from 'react';
import axiosInstance from "../../config/axiosConfig.ts";
import { AxiosResponse, AxiosError } from 'axios';

// Định nghĩa interface Category ở một nơi duy nhất
interface Category {
    id: number;
    name: string;
}

interface UseCategoriesResult {
    categories: Category[];
    categoriesLoading: boolean;
    categoriesError: string | null;
}

// 💡 Custom Hook để fetch danh sách Category từ Backend
const useCategories = (): UseCategoriesResult => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Gọi API đã cấu hình ở Backend (/api/categories)
                const response: AxiosResponse<Category[]> = await axiosInstance.get('/categories');
                setCategories(response.data || []);
                setCategoriesError(null);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                const errorMessage = (error as AxiosError).response?.status === 403
                    ? 'Lỗi bảo mật (403): Vui lòng kiểm tra cấu hình Spring Security cho /api/categories.'
                    : 'Không thể tải danh sách danh mục. Vui lòng kiểm tra kết nối API.';

                setCategoriesError(errorMessage);
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, categoriesLoading, categoriesError };
};

export default useCategories;