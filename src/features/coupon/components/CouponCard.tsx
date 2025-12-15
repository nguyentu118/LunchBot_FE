import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Ticket, Calendar, Users, Tag } from 'lucide-react';
import { Coupon } from '../hooks/useCouponList';

interface CouponCardProps {
    coupon: Coupon;
    showMerchantView?: boolean;
    brandColor?: string;
    onCopy?: (code: string) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({
                                                   coupon,
                                                   showMerchantView = false,
                                                   brandColor = '#FF5E62',
                                                   onCopy
                                               }) => {
    const isExpired = new Date(coupon.validTo) < new Date();
    const isOutOfStock = coupon.usedCount >= coupon.usageLimit;
    const isInactive = !coupon.isActive;
    const isDisabled = isExpired || isOutOfStock || isInactive;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getDiscountText = () => {
        if (coupon.discountType === 'PERCENTAGE') {
            return `-${coupon.discountValue}%`;
        }
        return `Giảm ${formatCurrency(coupon.discountValue)}`;
    };

    const getStatusBadge = () => {
        if (isInactive) return <Badge bg="secondary">Đã khóa</Badge>;
        if (isExpired) return <Badge bg="danger">Hết hạn</Badge>;
        if (isOutOfStock) return <Badge bg="warning" text="dark">Hết lượt</Badge>;
        return <Badge bg="success">Còn hiệu lực</Badge>;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(coupon.code);
        if (onCopy) {
            onCopy(coupon.code);
        }
    };

    return (
        <Card
            className={`h-100 shadow-sm ${isDisabled ? 'opacity-75' : ''}`}
            style={{
                borderLeft: `4px solid ${isDisabled ? '#6c757d' : brandColor}`,
                transition: 'transform 0.2s',
                cursor: isDisabled ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{
                                backgroundColor: isDisabled ? '#e9ecef' : `${brandColor}20`,
                                width: '40px',
                                height: '40px'
                            }}
                        >
                            <Ticket size={20} color={isDisabled ? '#6c757d' : brandColor} />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold" style={{ color: isDisabled ? '#6c757d' : brandColor }}>
                                {getDiscountText()}
                            </h5>
                            <small className="text-muted">
                                {coupon.discountType === 'PERCENTAGE' ? 'Giảm theo %' : 'Giảm cố định'}
                            </small>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                <div
                    className="mb-3 p-2 rounded text-center"
                    style={{
                        backgroundColor: '#f8f9fa',
                        border: `2px dashed ${isDisabled ? '#6c757d' : brandColor}`,
                        cursor: !isDisabled ? 'pointer' : 'default'
                    }}
                    onClick={!isDisabled ? handleCopyCode : undefined}
                >
                    <code className="fs-5 fw-bold" style={{ color: isDisabled ? '#6c757d' : brandColor }}>
                        {coupon.code}
                    </code>
                    {!isDisabled && (
                        <div className="mt-1">
                            <small className="text-muted">Nhấn để sao chép</small>
                        </div>
                    )}
                </div>

                <div className="mb-2 d-flex align-items-center gap-2 text-muted small">
                    <Tag size={16} />
                    <span>Đơn tối thiểu: <strong>{formatCurrency(coupon.minOrderValue)}</strong></span>
                </div>

                <div className="mb-2 d-flex align-items-center gap-2 text-muted small">
                    <Calendar size={16} />
                    <span>{formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}</span>
                </div>

                {showMerchantView && (
                    <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2 text-muted small">
                                <Users size={16} />
                                <span>Đã dùng: <strong>{coupon.usedCount}</strong></span>
                            </div>
                            <div className="text-muted small">
                                Giới hạn: <strong>{coupon.usageLimit}</strong>
                            </div>
                        </div>
                        <div className="progress mt-2" style={{ height: '6px' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                                    backgroundColor: brandColor
                                }}
                            />
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default CouponCard;