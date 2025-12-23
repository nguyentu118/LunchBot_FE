// features/cart/components/CartSummary.tsx

import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { CreditCard } from 'lucide-react';

interface CartSummaryProps {
    totalItems: number;
    totalPrice: number;
    onCheckout: () => void;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const CartSummary: React.FC<CartSummaryProps> = ({
                                                     totalItems,
                                                     totalPrice,
                                                     onCheckout
                                                 }) => {
    const finalTotal = totalPrice;

    return (
        <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="text-white border-0"
                         style={{ backgroundColor: '#FF5E62' }}
            >
                <h5 className="mb-0 fw-bold">Tóm tắt đơn hàng</h5>
            </Card.Header>
            <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                    <span>Tổng số món:</span>
                    <span className="fw-bold">{totalItems}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                    <span>Tạm tính:</span>
                    <span className="fw-bold">{formatCurrency(totalPrice)}</span>
                </div>

                <div className="d-flex justify-content-between mb-4">
                    <span className="h5 mb-0">Tổng cộng:</span>
                    <span className="h5 mb-0 text-danger fw-bold">
                        {formatCurrency(finalTotal)}
                    </span>
                </div>

                <Button
                    variant="danger"
                    className="w-100 py-2 fw-bold"
                    size="lg"
                    onClick={onCheckout}
                    disabled={totalItems === 0}
                >
                    <CreditCard size={20} className="me-2" />
                    Tiến hành thanh toán
                </Button>

                <p className="text-muted small text-center mt-3 mb-0">
                    * Phí ship có thể thay đổi tùy địa điểm
                </p>
            </Card.Body>
        </Card>
    );
};

export default CartSummary;