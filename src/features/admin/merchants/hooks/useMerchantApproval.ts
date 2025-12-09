import { useState } from 'react';
import { MerchantApiService } from '../services/merchantApi.service';
import { MerchantApprovalRequest, AdminMerchantResponse } from '../types/merchant.types';

interface UseMerchantApprovalReturn {
    isLoading: boolean;
    error: string | null;
    approveMerchant: (merchantId: number, data: MerchantApprovalRequest) => Promise<AdminMerchantResponse | null>;
}

export const useMerchantApproval = (): UseMerchantApprovalReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const approveMerchant = async (
        merchantId: number,
        data: MerchantApprovalRequest
    ): Promise<AdminMerchantResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await MerchantApiService.approveMerchant(merchantId, data);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, approveMerchant };
};