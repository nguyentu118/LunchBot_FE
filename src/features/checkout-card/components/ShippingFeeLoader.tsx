// src/features/shipping/components/ShippingFeeLoader.tsx

import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ShippingFeeLoaderProps {
    isLoading: boolean;
    isSuccess: boolean;
    fee?: number;
    error?: string;
}

const ShippingFeeLoader: React.FC<ShippingFeeLoaderProps> = ({
                                                                 isLoading,
                                                                 isSuccess,
                                                                 fee,
                                                                 error
                                                             }) => {
    // Đang tính toán
    if (isLoading) {
        return (
            <Alert variant="info" className="mb-3 py-2">
                <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span className="small">Đang tính phí giao hàng...</span>
                </div>
            </Alert>
        );
    }

    // Tính toán thành công
    if (isSuccess && fee !== undefined && fee > 0) {
        return (
            <Alert variant="success" className="mb-3 py-2">
                <div className="d-flex align-items-center">
                    <CheckCircle size={18} className="me-2" />
                    <span className="small">
                        Phí giao hàng: <strong>{new Intl.NumberFormat('vi-VN').format(fee)}₫</strong>
                    </span>
                </div>
            </Alert>
        );
    }

    // Có lỗi
    if (error) {
        return (
            <Alert variant="warning" className="mb-3 py-2">
                <div className="d-flex align-items-center">
                    <AlertTriangle size={18} className="me-2" />
                    <span className="small">
                        {error} (Sử dụng phí mặc định)
                    </span>
                </div>
            </Alert>
        );
    }

    return null;
};

export default ShippingFeeLoader;