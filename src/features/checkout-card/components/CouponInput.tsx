
// nhập mã giam giá
import React, { useState } from 'react';
import { Card, InputGroup, Form, Button, Alert, Badge, ListGroup } from 'react-bootstrap';
import { Tag, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CouponInfo } from '../types/checkout.types';

interface CouponInputProps {
    appliedCouponCode: string | null;
    availableCoupons: CouponInfo[];
    onApplyCoupon: (code: string) => Promise<void>;
    onRemoveCoupon: () => void;
    isLoading?: boolean;
    discountAmount?: number;
}

const CouponInput: React.FC<CouponInputProps> = ({
                                                     appliedCouponCode,
                                                     availableCoupons,
                                                     onApplyCoupon,
                                                     onRemoveCoupon,
                                                     isLoading = false,
                                                     discountAmount = 0
                                                 }) => {
    const [couponCode, setCouponCode] = useState('');
    const [showAvailable, setShowAvailable] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async () => {
        if (!couponCode.trim()) {
            setError('Vui lòng nhập mã giảm giá');
            return;
        }

        try {
            setError('');
            await onApplyCoupon(couponCode.trim().toUpperCase());
            setCouponCode('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Mã giảm giá không hợp lệ');
        }
    };

    const handleSelectCoupon = async (code: string) => {
        try {
            setError('');
            await onApplyCoupon(code);
            setShowAvailable(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể áp dụng mã giảm giá');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 d-flex align-items-center">
                    <Tag size={20} className="text-danger me-2" />
                    Mã giảm giá
                </h5>
            </Card.Header>

            <Card.Body>
                {/* Applied Coupon Success */}
                {appliedCouponCode && (
                    <Alert variant="success" className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <Check size={20} />
                            <div>
                                <strong>Mã "{appliedCouponCode}" đã được áp dụng</strong>
                                <p className="mb-0 small">Giảm giá: {formatPrice(discountAmount)}</p>
                            </div>
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={onRemoveCoupon}
                            className="text-danger p-0"
                        >
                            <X size={20} />
                        </Button>
                    </Alert>
                )}

                {/* Input Coupon */}
                {!appliedCouponCode && (
                    <div>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                value={couponCode}
                                onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setError('');
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleApply();
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <Button
                                variant="primary"
                                onClick={handleApply}
                                disabled={isLoading || !couponCode.trim()}
                            >
                                {isLoading ? (
                                    <span className="spinner-border spinner-border-sm" />
                                ) : (
                                    'Áp dụng'
                                )}
                            </Button>
                        </InputGroup>

                        {error && (
                            <Alert variant="danger" className="py-2 mb-3">
                                <small>{error}</small>
                            </Alert>
                        )}
                    </div>
                )}

                {/* Available Coupons */}
                {availableCoupons.length > 0 && !appliedCouponCode && (
                    <div>
                        <Button
                            variant="link"
                            className="text-decoration-none p-0 mb-2 d-flex align-items-center"
                            onClick={() => setShowAvailable(!showAvailable)}
                        >
                            <Tag size={16} className="me-2" />
                            <span className="fw-semibold">
                Mã giảm giá khả dụng ({availableCoupons.length})
              </span>
                            {showAvailable ? (
                                <ChevronUp size={16} className="ms-2" />
                            ) : (
                                <ChevronDown size={16} className="ms-2" />
                            )}
                        </Button>

                        {showAvailable && (
                            <ListGroup className="mt-2">
                                {availableCoupons.map((coupon) => (
                                    <ListGroup.Item
                                        key={coupon.id}
                                        className="d-flex justify-content-between align-items-center"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelectCoupon(coupon.code)}
                                    >
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Badge bg="danger">{coupon.code}</Badge>
                                                <span className="small fw-bold text-success">
                          {coupon.discountType === 'PERCENTAGE'
                              ? `-${coupon.discountValue}%`
                              : `-${formatPrice(coupon.discountValue)}`}
                        </span>
                                            </div>
                                            <p className="mb-0 small text-muted">
                                                {coupon.description}
                                            </p>
                                        </div>
                                        <Button variant="outline-primary" size="sm">
                                            Áp dụng
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                )}

                {/* No Coupons Available */}
                {availableCoupons.length === 0 && !appliedCouponCode && (
                    <Alert variant="info" className="mb-0 small">
                        Hiện tại không có mã giảm giá khả dụng cho đơn hàng này.
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default CouponInput;