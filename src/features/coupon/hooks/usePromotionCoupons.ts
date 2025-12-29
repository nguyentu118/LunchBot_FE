import { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import toast from 'react-hot-toast';

export interface CouponDetail {
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
    remainingUsage: number;
}

export interface MerchantCoupons {
    merchantId: number;
    restaurantName: string;
    address: string;
    avatarUrl: string;
    phone: string;
    coupons: CouponDetail[];
}

export interface PaginatedCouponsResponse {
    content: MerchantCoupons[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface UsePromotionCouponsProps {
    page?: number;
    size?: number;
    onlyActive?: boolean;
    keyword?: string;
    sortBy?: 'discount_high' | 'discount_low' | null;
    autoFetch?: boolean;
}

export const usePromotionCoupons = ({
                                        page = 0,
                                        size = 3,
                                        onlyActive = true,
                                        keyword = '',
                                        sortBy = null,
                                        autoFetch = true
                                    }: UsePromotionCouponsProps = {}) => {
    const [data, setData] = useState<PaginatedCouponsResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPromotionCoupons = async (
        currentPage: number = page,
        currentSize: number = size,
        currentKeyword: string = keyword,
        currentSortBy: string | null = sortBy
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const params: any = {
                page: currentPage,
                size: currentSize,
                onlyActive
            };

            if (currentKeyword && currentKeyword.trim()) {
                params.keyword = currentKeyword.trim();
            }

            if (currentSortBy) {
                params.sortBy = currentSortBy;
            }

            const response = await axiosInstance.get('/coupons/all-grouped', { params });
            setData(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Không thể tải danh sách khuyến mãi';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            fetchPromotionCoupons(page, size, keyword, sortBy);
        }
    }, [page, size, keyword, sortBy, onlyActive, autoFetch]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchPromotionCoupons
    };
};