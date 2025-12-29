import React, { useState, useRef } from 'react';
import { MerchantCoupons, CouponDetail } from '../hooks/usePromotionCoupons';
import { useNavigate } from 'react-router-dom';

interface MerchantCouponCardProps {
    merchant: MerchantCoupons;
    onCouponClick?: (coupon: CouponDetail) => void;
}

const MerchantCouponCard: React.FC<MerchantCouponCardProps> = ({ merchant, onCouponClick }) => {
    const BRAND_COLOR = 'rgb(255, 94, 98)';
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const handleNavigateToProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/merchants/profile/${merchant.merchantId}`);
    };

    const renderAvatar = () => {
        if (merchant.avatarUrl) {
            return (
                <img
                    src={merchant.avatarUrl}
                    alt={merchant.restaurantName}
                    className="rounded-circle border border-3 shadow-sm"
                    style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderColor: 'white',
                        cursor: 'pointer'
                    }}
                    onClick={handleNavigateToProfile}
                />
            );
        }
        const initial = merchant.restaurantName.charAt(0).toUpperCase();
        return (
            <div
                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm fw-bold text-white border border-3"
                style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: BRAND_COLOR,
                    fontSize: '24px',
                    borderColor: 'white',
                    cursor: 'pointer'
                }}
                onClick={handleNavigateToProfile}
            >
                {initial}
            </div>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
    };

    const getDiscountDisplay = (coupon: CouponDetail) => {
        if (coupon.discountType === 'PERCENTAGE') {
            return {
                main: `${coupon.discountValue}%`,
                sub: 'GIẢM'
            };
        }
        return {
            main: coupon.discountValue >= 1000 ? `${(coupon.discountValue / 1000).toFixed(0)}K` : `${coupon.discountValue}`,
            sub: 'VNĐ'
        };
    };

    const getRemainingPercentage = (coupon: CouponDetail) => {
        return ((coupon.remainingUsage / coupon.usageLimit) * 100).toFixed(0);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage > 50) return 'success';
        if (percentage > 20) return 'warning';
        return 'danger';
    };

    const checkScrollability = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200; // Giảm từ 320 xuống 200
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });

            setTimeout(checkScrollability, 300);
        }
    };

    React.useEffect(() => {
        checkScrollability();
        const handleResize = () => checkScrollability();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [merchant.coupons]);

    return (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            {/* Merchant Header */}
            <div className="p-3 border-bottom bg-light" style={{ borderRadius: '16px 16px 0 0' }}>
                <div className="d-flex align-items-center gap-3">
                    {renderAvatar()}
                    <div className="flex-grow-1 overflow-hidden">
                        <h5
                            className="mb-1 fw-bold text-dark"
                            style={{ cursor: 'pointer' }}
                            onClick={handleNavigateToProfile}
                        >
                            {merchant.restaurantName}
                            <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '14px' }}></i>
                        </h5>
                        <div className="d-flex flex-wrap gap-2 small text-muted">
                            <span className="text-truncate" style={{ maxWidth: '250px' }}>
                                <i className="bi bi-geo-alt-fill me-1" style={{ color: BRAND_COLOR }}></i>
                                {merchant.address}
                            </span>
                            <span>
                                <i className="bi bi-telephone-fill me-1" style={{ color: BRAND_COLOR }}></i>
                                {merchant.phone}
                            </span>
                        </div>
                    </div>
                    <span
                        className="badge rounded-pill px-3 py-2 flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255, 94, 98, 0.15)', color: BRAND_COLOR, fontSize: '0.8rem' }}
                    >
                        {merchant.coupons.length} mã
                    </span>
                </div>
            </div>

            {/* Coupons Carousel */}
            <div className="position-relative p-3">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        className="btn btn-light position-absolute start-0 top-50 translate-middle-y shadow-sm"
                        style={{
                            zIndex: 10,
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            marginLeft: '8px',
                            border: '2px solid #e9ecef'
                        }}
                        onClick={() => scroll('left')}
                    >
                        <i className="bi bi-chevron-left fw-bold"></i>
                    </button>
                )}

                {/* Scrollable Container */}
                <div
                    ref={scrollContainerRef}
                    className="d-flex gap-2 overflow-auto pb-2"
                    onScroll={checkScrollability}
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        scrollBehavior: 'smooth'
                    }}
                >
                    <style>{`
                        .d-flex.overflow-auto::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {merchant.coupons.map((coupon) => {
                        const discount = getDiscountDisplay(coupon);
                        const remainingPercent = parseFloat(getRemainingPercentage(coupon));

                        return (
                            <div
                                key={coupon.id}
                                className="flex-shrink-0 position-relative"
                                style={{ width: '180px' }}
                                onClick={() => onCouponClick?.(coupon)}
                            >
                                <div
                                    className="h-100 overflow-hidden"
                                    style={{
                                        border: `2px dashed ${BRAND_COLOR}`,
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 94, 98, 0.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Discount Badge */}
                                    <div
                                        className="text-white text-center py-2"
                                        style={{ backgroundColor: BRAND_COLOR }}
                                    >
                                        <div className="fw-bold mb-1" style={{ fontSize: '26px', lineHeight: '1' }}>
                                            {discount.main}
                                        </div>
                                        <small style={{ fontSize: '10px', letterSpacing: '0.5px', opacity: 0.95 }}>
                                            {discount.sub}
                                        </small>
                                    </div>

                                    {/* Coupon Info */}
                                    <div className="p-2">
                                        {/* Code */}
                                        <div className="d-flex align-items-center mb-2">
                                            <code
                                                className="fw-bold px-2 py-1 rounded flex-grow-1 text-center"
                                                style={{
                                                    color: BRAND_COLOR,
                                                    backgroundColor: 'rgba(255, 94, 98, 0.1)',
                                                    fontSize: '13px',
                                                    border: `1px solid ${BRAND_COLOR}30`
                                                }}
                                            >
                                                {coupon.code}
                                            </code>
                                            <i className="bi bi-clipboard-check ms-1 text-muted" style={{ fontSize: '14px' }}></i>
                                        </div>

                                        {/* Min Order */}
                                        <div className="small mb-2">
                                            <div className="d-flex align-items-start">
                                                <i className="bi bi-cart-check-fill me-1 flex-shrink-0" style={{ color: BRAND_COLOR, fontSize: '12px' }}></i>
                                                <span className="text-dark" style={{ fontSize: '11px' }}>
                                                    Đơn từ <strong>{formatCurrency(coupon.minOrderValue)}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mt-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <small className="text-muted" style={{ fontSize: '10px' }}>
                                                    Còn: <strong className="text-dark">{coupon.remainingUsage}/{coupon.usageLimit}</strong>
                                                </small>
                                                <small
                                                    className={`badge bg-${getProgressColor(remainingPercent)} bg-opacity-25 text-${getProgressColor(remainingPercent)}`}
                                                    style={{ fontSize: '9px' }}
                                                >
                                                    {remainingPercent}%
                                                </small>
                                            </div>
                                            <div className="progress" style={{ height: '5px', borderRadius: '10px' }}>
                                                <div
                                                    className={`progress-bar bg-${getProgressColor(remainingPercent)}`}
                                                    style={{ width: `${remainingPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        className="btn btn-light position-absolute end-0 top-50 translate-middle-y shadow-sm"
                        style={{
                            zIndex: 10,
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            marginRight: '8px',
                            border: '2px solid #e9ecef'
                        }}
                        onClick={() => scroll('right')}
                    >
                        <i className="bi bi-chevron-right fw-bold"></i>
                    </button>
                )}
            </div>

            {/* Scroll Indicator */}
            {merchant.coupons.length > 4 && (
                <div className="text-center pb-2">
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                        <i className="bi bi-arrow-left-right me-1"></i>
                        Vuốt để xem thêm
                    </small>
                </div>
            )}
        </div>
    );
};

export default MerchantCouponCard;