// src/hooks/usePopularMerchants.ts

import { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { PopularMerchantDto } from '../types/merchant';

interface UsePopularMerchantsResult {
    merchants: PopularMerchantDto[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const usePopularMerchants = (limit: number = 8): UsePopularMerchantsResult => {
    const [merchants, setMerchants] = useState<PopularMerchantDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMerchants = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await merchantService.getPopularMerchants(limit);
            setMerchants(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhà hàng');
            console.error('Error in usePopularMerchants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, [limit]);

    return {
        merchants,
        loading,
        error,
        refetch: fetchMerchants
    };
};

export default usePopularMerchants;