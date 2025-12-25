import React from 'react';
import {Badge, Button, Card} from 'react-bootstrap';
import {Calendar, Edit, Tag, Ticket, Trash2, Users} from 'lucide-react';
import {Coupon} from '../hooks/useCouponList';
import {toast} from 'react-hot-toast';

interface CouponCardProps {
    coupon: Coupon;
    showMerchantView?: boolean;
    brandColor?: string;
    onCopy?: (code: string) => void;
    onDelete?: (id: number) => void;
    onEdit?: (coupon: Coupon) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({
                                                   coupon,
                                                   showMerchantView = false,
                                                   brandColor = '#FF5E62',
                                                   onCopy,
                                                   onDelete,
                                                   onEdit
                                               }) => {
    const isExpired = new Date(coupon.validTo) < new Date();
    const isOutOfStock = coupon.usedCount >= coupon.usageLimit;
    const isInactive = !coupon.isActive;
    const isDisabled = isExpired || isOutOfStock || isInactive;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
        if (isInactive) return <Badge bg="secondary" className="py-1 px-2" style={{fontSize: '0.7rem'}}>Đã khóa</Badge>;
        if (isExpired) return <Badge bg="danger" className="py-1 px-2" style={{fontSize: '0.7rem'}}>Hết hạn</Badge>;
        if (isOutOfStock) return <Badge bg="warning" text="dark" className="py-1 px-2" style={{fontSize: '0.7rem'}}>Hết
            lượt</Badge>;
        return <Badge bg="success" className="py-1 px-2" style={{fontSize: '0.7rem'}}>Còn hiệu lực</Badge>;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(coupon.code);
        if (onCopy) {
            onCopy(coupon.code);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        toast.custom((t) => (
            <div
                style={{
                    opacity: t.visible ? 1 : 0,
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'all 0.15s ease-out',
                    maxWidth: '320px',
                    width: '100%',
                    backgroundColor: '#fff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    borderRadius: '10px',
                    padding: '16px',
                    pointerEvents: 'auto',
                    borderTop: `3px solid ${brandColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                <div className="mb-2 d-flex align-items-center justify-content-center"
                     style={{width: '40px', height: '40px', backgroundColor: '#fff5f5', borderRadius: '50%'}}>
                    <Trash2 size={20} color="#dc3545"/>
                </div>

                <h6 className="fw-bold text-dark mb-1" style={{fontSize: '0.9rem'}}>Xác nhận xóa?</h6>
                <p className="text-muted mb-3" style={{fontSize: '0.8rem'}}>Xóa mã: <b>{coupon.code}</b></p>

                <div className="d-flex gap-2 w-100">
                    <Button
                        className="flex-grow-1"
                        variant="danger"
                        size="sm"
                        style={{borderRadius: '6px', fontSize: '0.8rem', padding: '6px 12px'}}
                        onClick={() => {
                            onDelete?.(coupon.id);
                            toast.dismiss(t.id);
                        }}
                    >
                        Xóa
                    </Button>
                    <Button
                        className="flex-grow-1"
                        variant="light"
                        size="sm"
                        style={{borderRadius: '6px', fontSize: '0.8rem', padding: '6px 12px'}}
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Hủy
                    </Button>
                </div>
            </div>
        ), {
            duration: 4000,
            position: 'top-center',
        });
    };

    return (
        <Card
            className={`h-100 shadow-sm ${isDisabled ? 'opacity-75' : ''}`}
            style={{
                borderLeft: `3px solid ${isDisabled ? '#6c757d' : brandColor}`,
                transition: 'transform 0.2s',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem'
            }}
            onMouseEnter={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <Card.Body className="p-3">
                {/* Header - Giảm giá & Status */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                            style={{
                                backgroundColor: isDisabled ? '#e9ecef' : `${brandColor}20`,
                                width: '32px',
                                height: '32px'
                            }}
                        >
                            <Ticket size={16} color={isDisabled ? '#6c757d' : brandColor}/>
                        </div>
                        <div>
                            <div className="fw-bold mb-0"
                                 style={{color: isDisabled ? '#6c757d' : brandColor, fontSize: '0.95rem'}}>
                                {getDiscountText()}
                            </div>
                            <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                {coupon.discountType === 'PERCENTAGE' ? 'Giảm theo %' : 'Giảm cố định'}
                            </small>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Mã Coupon */}
                <div
                    className="mb-2 py-1 px-2 rounded text-center"
                    style={{
                        backgroundColor: '#f8f9fa',
                        border: `1.5px dashed ${isDisabled ? '#6c757d' : brandColor}`,
                        cursor: !isDisabled ? 'pointer' : 'default'
                    }}
                    onClick={!isDisabled ? handleCopyCode : undefined}
                >
                    <code className="fw-bold d-block" style={{
                        color: isDisabled ? '#6c757d' : brandColor,
                        fontSize: '0.8rem',
                        letterSpacing: '0.5px'
                    }}>
                        {coupon.code}
                    </code>
                    {!isDisabled && (
                        <small className="text-muted d-block" style={{fontSize: '0.6rem', marginTop: '2px'}}>
                            Nhấn để sao chép
                        </small>
                    )}
                </div>

                {/* Thông tin chi tiết */}
                <div className="mb-1 d-flex align-items-center gap-1 text-muted" style={{fontSize: '0.75rem'}}>
                    <Tag size={12}/>
                    <span>Đơn tối thiểu: <strong>{formatCurrency(coupon.minOrderValue)}</strong></span>
                </div>

                <div className="mb-2 d-flex align-items-center gap-1 text-muted" style={{fontSize: '0.75rem'}}>
                    <Calendar size={12}/>
                    <span>{formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}</span>
                </div>

                {/* Merchant View */}
                {showMerchantView && (
                    <div className="mt-2 pt-2 border-top">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-1 text-muted" style={{fontSize: '0.75rem'}}>
                                <Users size={12}/>
                                <span>Đã dùng: <strong>{coupon.usedCount}</strong></span>
                            </div>
                            <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                Giới hạn: <strong>{coupon.usageLimit}</strong>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress mb-2" style={{height: '4px'}}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                                    backgroundColor: brandColor
                                }}
                            />
                        </div>

                        {/* Buttons */}

                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                                style={{fontSize: '0.75rem', padding: '4px 8px'}}
                                onClick={!isDisabled ? () => onEdit?.(coupon) : undefined}
                            >
                                <Edit size={12}/>Sửa
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                                style={{fontSize: '0.75rem', padding: '4px 8px'}}
                                onClick={!isDisabled ? handleDeleteClick : undefined}
                            >
                                <Trash2 size={12}/> Xóa
                            </Button>

                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default CouponCard;