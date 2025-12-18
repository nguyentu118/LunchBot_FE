import { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import toast from 'react-hot-toast';

export interface Coupon {
    id: number;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderValue: number;
    usageLimit: number;
    usedCount: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

interface UseCouponListProps {
    merchantId?: number;
    onlyActive?: boolean;
    autoFetch?: boolean;
}

export const useCouponList = ({ merchantId, onlyActive = false, autoFetch = true }: UseCouponListProps = {}) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCoupons = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (merchantId !== undefined) {
                // Người dùng xem coupon của merchant
                response = await axiosInstance.get(`/coupons/${merchantId}/active`);
            } else {
                // Merchant xem coupon của mình
                const endpoint = onlyActive ? '/merchants/my-coupons/active' : '/merchants/my-coupons';
                response = await axiosInstance.get(endpoint);
            }

            setCoupons(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Không thể tải danh sách mã giảm giá';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCoupon = async (id: number) => {
        try {
            // ⭐ Backend sẽ tự lấy merchantId từ JWT token
            await axiosInstance.delete(`/coupons/${id}`);
            toast.success('Đã xóa mã giảm giá thành công');
            await fetchCoupons(); // Tự động refresh sau khi xóa
            return true;
        } catch (err: any) {
            toast.error(err.response?.data || 'Không thể xóa mã giảm giá');
            return false;
        }
    };

    // ✅ useEffect phải đặt TRƯỚC return
    useEffect(() => {
        if (autoFetch) {
            fetchCoupons();
        }
    }, [merchantId, onlyActive, autoFetch]);

    // ✅ Return tất cả functions và states
    return {
        coupons,
        isLoading,
        error,
        refetch: fetchCoupons,
        deleteCoupon
    };
};