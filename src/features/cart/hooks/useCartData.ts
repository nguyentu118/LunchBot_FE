import { useState, useEffect } from 'react';
import { CartApiService } from '../services/CartApi.service';
import { GuestCartHelper } from '../types/guestCart';
import axiosInstance from "../../../config/axiosConfig";
import {CartResponse} from "../types/cart.ts";

const BACKEND_BASE_URL = 'http://localhost:8080';

interface UseCartDataResult {
    data: CartResponse | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

// Hàm làm sạch chuỗi JSON ảnh (nếu API trả về dạng raw string)
const cleanJsonImage = (jsonString: string): string | null => {
    try {
        const cleaned = jsonString.replace(/[\[\]"]/g, '').trim(); // Xóa [ ] "
        const urls = cleaned.split(',');
        return urls.length > 0 ? urls[0].trim() : null;
    } catch {
        return null;
    }
};

// Hàm chuẩn hóa đường dẫn ảnh (Thêm domain nếu thiếu)
const normalizeImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/images/placeholder-dish.jpg';

    // Nếu là link online (http/https) -> Dùng luôn
    if (path.startsWith('http')) return path;

    // Nếu là đường dẫn tương đối -> Thêm domain Backend
    // Xử lý trường hợp có hoặc không có dấu / ở đầu
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
};

const DishService = {
    async getDishInfo(dishId: number) {
        try {
            const response = await axiosInstance.get(`/dishes/${dishId}`);
            const d = response.data;

            if (!d || !d.id) return null;

            // --- LOGIC TÌM ẢNH MỚI (Bắt mọi trường hợp) ---
            let rawPath = '';

            // Trường hợp 1: API trả về mảng đối tượng (như trong DishDetail)
            if (d.images && Array.isArray(d.images) && d.images.length > 0) {
                rawPath = d.images[0].imageUrl;
            }
            // Trường hợp 2: API trả về chuỗi trực tiếp
            else if (d.imageUrl) {
                rawPath = d.imageUrl;
            }
            // Trường hợp 3: API trả về chuỗi JSON thô (như Database)
            else if (d.imagesUrls) {
                rawPath = cleanJsonImage(d.imagesUrls) || '';
            }
            // ----------------------------------------------

            // Chuẩn hóa link ảnh (thêm http://localhost:8080...)
            const finalImage = normalizeImageUrl(rawPath);

            return {
                id: d.id,
                name: d.name || d.dishName,
                image: finalImage, // Link ảnh đã đầy đủ domain
                price: d.discountPrice || d.price,
                description: d.description,
                preparationTime: d.preparationTime
            };
        } catch (error) {
            console.warn(`Không lấy được thông tin món ${dishId}`, error);
            return null;
        }
    }
};

export const useCartData = (): UseCartDataResult => {
    const [data, setData] = useState<CartResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCart = async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            if (token) {
                // USER ĐÃ ĐĂNG NHẬP
                const response = await CartApiService.getCart();
                // Với user đăng nhập, mình cũng map lại để đảm bảo ảnh có domain
                if (response && response.items) {
                    response.items = response.items.map(item => ({
                        ...item,
                        // Nếu ảnh backend trả về chưa có http -> thêm vào
                        dishImage: normalizeImageUrl(item.dishImage)
                    }));
                }
                setData(response);
            } else {
                // KHÁCH VÃNG LAI (GUEST)
                const localCartItems = GuestCartHelper.getCart();

                if (localCartItems.length === 0) {
                    setData({ items: [], totalItems: 0, totalPrice: 0 });
                    setIsLoading(false);
                    return;
                }

                const itemPromises = localCartItems.map(async (cartItem) => {
                    const dishDetails = await DishService.getDishInfo(cartItem.dishId);

                    // Nếu không lấy được info món, trả về null để lọc sau
                    if (!dishDetails) return null;

                    return {
                        id: Date.now() + Math.random(),
                        dishId: dishDetails.id,
                        dishName: dishDetails.name,
                        dishImage: dishDetails.image, // Ảnh đã có full URL
                        price: dishDetails.price,
                        quantity: cartItem.quantity,
                        subtotal: dishDetails.price * cartItem.quantity
                    };
                });

                const validItems = (await Promise.all(itemPromises))
                    .filter((item): item is NonNullable<typeof item> => item !== null);

                const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = validItems.reduce((sum, item) => sum + item.subtotal, 0);

                setData({ items: validItems, totalItems, totalPrice });
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err : new Error('Lỗi tải giỏ hàng'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        const handleCartUpdate = () => fetchCart();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    return { data, isLoading, error, refetch: fetchCart };
};