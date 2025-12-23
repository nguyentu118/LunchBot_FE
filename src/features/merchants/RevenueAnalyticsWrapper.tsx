import React, { useEffect, useState } from 'react';
import RevenueStatistics from '../../features/merchants/RevenueStatistics';
import axiosInstance from '../../config/axiosConfig';

const RevenueAnalyticsWrapper: React.FC = () => {
    const [merchantId, setMerchantId] = useState<number>(0);

    useEffect(() => {
        const fetchMerchantId = async () => {
            try {
                const response = await axiosInstance.get('/merchants/current/id');
                setMerchantId(response.data.merchantId);
            } catch (error) {
                console.error('Error fetching merchant ID:', error);
            }
        };

        fetchMerchantId();
    }, []);

    if (!merchantId) {
        return <div className="text-center py-5">Đang tải...</div>;
    }

    return <RevenueStatistics merchantId={merchantId} />;
};

export default RevenueAnalyticsWrapper;