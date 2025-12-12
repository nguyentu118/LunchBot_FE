
import { useState, useEffect } from 'react';
import { SuggestedDish } from '../types/suggestedDish';
import api from '../../../config/axiosConfig';
interface UseSuggestedDishesResult {
    data: SuggestedDish[];
    isLoading: boolean;
    error: string | null;
}

const useSuggestedDishes = (): UseSuggestedDishesResult => {
    const [data, setData] = useState<SuggestedDish[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Định nghĩa hàm fetch
        const fetchDishes = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 2. Gọi API GET đến endpoint đã tạo ở Backend
                const response = await api.get('/dishes/suggested');

                // 3. Cập nhật dữ liệu
                setData(response.data);

            } catch (err) {
                // 4. Xử lý lỗi (Có thể là lỗi mạng, 500,...)
                console.error("Error fetching suggested dishes:", err);
                setError("Không thể tải danh sách món ăn gợi ý.");
                // Giữ lại dữ liệu giả lập hoặc trả về mảng rỗng tùy theo chiến lược của bạn
                setData([]);
            } finally {
                // 5. Kết thúc trạng thái loading
                setIsLoading(false);
            }
        };

        fetchDishes();

        // Cleanup function (Nếu cần)
        // return () => { controller.abort() }

    }, []); // [] đảm bảo chỉ chạy một lần khi component mount

    return { data, isLoading, error };
};

export default useSuggestedDishes;